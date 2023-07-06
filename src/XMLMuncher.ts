import expat from "node-expat";
import EventEmitter from "node:events";
import { ReadStream, createReadStream } from "node:fs";

type Element = Record<string, any>;

export class XMLMuncher extends EventEmitter {
  public parser: expat.Parser;

  constructor() {
    super();

    this.parser = new expat.Parser("UTF-8");
    this.setupParser();
  }

  protected setupParser() {
    let currentElement: Element = {};
    const stack = new Array<Element>();
    const nameStack = new Array<string>();

    /* If there's any sort of error, immediately throw. */
    this.parser.on("error", (error) => {
      throw new Error(error);
    });

    this.parser.on("startElement", (element, attributes) => {
      /* Create a fresh element, full of hopes and dreams */
      stack.push(currentElement);
      nameStack.push(element);
      currentElement = {};

      /* Add attributes to the element */
      for (const key in attributes) {
        currentElement[`$${key}`] = attributes[key];
      }
    });

    this.parser.on("endElement", (element) => {
      let newElement: Element | string = currentElement;
      currentElement = stack.pop()!;

      /* If the element only contains a text attribute and nothing else,
      let's turn it into a string. */
      if (Object.keys(newElement).length === 1 && "#text" in newElement) {
        newElement = newElement["#text"];
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
      this.emit(`path:${"//" + nameStack.join("/")}`, newElement);
      nameStack.pop();
    });

    this.parser.on("text", (text: string) => {
      /* There's going to be a lot of text nodes with just spaces and newlines,
      so let's just ignore those. */
      if (text.trim() === "") return;

      currentElement["#text"] = text;
    });
  }

  async munch(text: string): Promise<void>;

  async munch(stream: ReadStream): Promise<void>;

  async munch(input: ReadStream | string) {
    if (typeof input === "string") {
      /* Let's check if the parser is currently writable, and if we're
      actually running. */
      if (this.running && this.parser.writable) {
        this.parser.write(input);
      }
    } else {
      /* Get chunks from the stream and feed them to the parser */
      for await (const data of input) {
        this.munch(data);
      }
    }
  }

  running = true;

  stop() {
    this.running = false;
    this.parser.stop();
  }

  async munchFile(filePath: string) {
    await this.munch(
      createReadStream(filePath, {
        encoding: "utf-8",
      })
    );
  }
}
