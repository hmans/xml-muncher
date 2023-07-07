import expat from "node-expat";
import EventEmitter from "node:events";
import { ReadStream, createReadStream } from "node:fs";

type Element = Record<string, any>;

export class XMLMuncher extends EventEmitter {
  parser: expat.Parser;
  running = true;

  constructor() {
    super();

    this.parser = new expat.Parser("UTF-8");
    this.setupParser();
  }

  protected hasEvents(...names: string[]) {
    return names.some((name) => this.listenerCount(name) > 0);
  }

  protected setupParser() {
    /** The current element we're filling with data. */
    let currentElement: Element = {};

    /**
     * Are we currently recording? This is controlled through the events
     * the user is subscribed to to make sure we don't unneccessarily fill
     * RAM with data we never need.
     */
    let recording = false;

    /**
     * A stack of elements we've filled with data.
     */
    const elementStack = new Array<Element>();

    /**
     * A stack of element names we've encountered. This is primarily used
     * to build the path for the path event.
     */
    const nameStack = new Array<string>();

    /**
     * Generate the current path from the name stack.
     */
    const getCurrentPath = () => "//" + nameStack.join("/");

    /* If there's any sort of error, immediately throw. */
    this.parser.on("error", (error) => {
      throw new Error(error);
    });

    this.parser.on("startElement", (element, attributes) => {
      nameStack.push(element);

      /* Test if this element is something the user requested. If so,
      enable recording mode. */
      if (this.hasEvents(`element:${element}`, `path:${getCurrentPath()}`)) {
        recording = true;
      }

      /* Abort if we're not recording. */
      if (!recording) return;

      /* We're going to push the current element onto the stack and create a new
      one. The new element will eventually become a property on the previous element,
      but this happens in the `endElement` event handler. */
      elementStack.push(currentElement);
      currentElement = {};

      /* Add attributes to the element */
      for (const key in attributes) {
        currentElement[`$${key}`] = attributes[key];
      }
    });

    this.parser.on("endElement", (element) => {
      if (!recording) return;

      let newElement: Element | string | null = currentElement;
      currentElement = elementStack.pop()!;

      /* If the element only contains a text attribute and nothing else,
      let's turn it into a string. */
      if (Object.keys(newElement).length === 1 && "#text" in newElement) {
        newElement = newElement["#text"];
      }

      /* If the element is an empty object, let's turn it into null. */
      if (
        typeof newElement === "object" &&
        Object.keys(newElement as object).length === 0
      ) {
        newElement = null;
      }

      /* Sort the new element into the current element */
      if (currentElement[element] === undefined) {
        /* Nothing of the name exists yet, so we can just set it. */
        currentElement[element] = newElement;
      } else if (Array.isArray(currentElement[element])) {
        /* The element of this name is an array, so let's add the new element to that. */
        currentElement[element].push(newElement);
      } else {
        /* Something is already using the name, so let's turn it into an array. */
        currentElement[element] = [currentElement[element], newElement];
      }

      /* Emit element event */
      this.emit(`element:${element}`, newElement);

      /* Emit path event */
      const path = getCurrentPath();
      this.emit(`path:${path}`, newElement);
      nameStack.pop();

      /* If the user was listening for this element, stop recording, and wipe the state. */
      if (this.hasEvents(`element:${element}`, `path:${path}`)) {
        recording = false;
        currentElement = {};
        elementStack.length = 0;
      }
    });

    this.parser.on("text", (text: string) => {
      /* Early exit if we're not recording. */
      if (!recording) return;

      /* There's going to be a lot of text nodes with just spaces and newlines,
      so let's just ignore those. */
      if (text.trim() === "") return;

      currentElement["#text"] = text;
    });
  }

  munch(text: string) {
    /* Let's check if the parser is currently writable, and if we're
      actually running. */
    if (this.running && this.parser.writable) {
      this.parser.write(text);
    }
  }

  async munchStream(stream: ReadStream) {
    /* Get chunks from the stream and feed them to the parser */
    for await (const data of stream) {
      if (!this.running) break;
      this.munch(data);
    }
  }

  stop() {
    this.running = false;
    this.parser.stop();
  }

  async munchFile(filePath: string) {
    await this.munchStream(
      createReadStream(filePath, {
        encoding: "utf-8",
      })
    );
  }
}
