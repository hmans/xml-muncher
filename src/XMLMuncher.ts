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
      for (const [key, value] of Object.entries(attributes)) {
        currentElement[`$${key}`] = value;
      }
    });

    this.parser.on("endElement", (element) => {
      let newElement: Element | string = currentElement;
      currentElement = stack.pop()!;

      /* If the element only contains a text attribute and nothing else,
      let's turn it into a string. */
      if (Object.keys(newElement).length === 1 && newElement["#text"]) {
        newElement = newElement["#text"];
      }

      /* Sort the new element into the current element */
      if (currentElement[element] === undefined) {
        currentElement[element] = newElement;
      } else if (Array.isArray(currentElement[element])) {
        currentElement[element].push(newElement);
      } else {
        currentElement[element] = [currentElement[element], newElement];
      }

      /* Generate the path for this element */
      const path = "//" + nameStack.join("/");
      nameStack.pop();

      /* Emit events */
      this.emit(`element:${element}`, newElement);
      this.emit(`path:${path}`, newElement);
    });

    this.parser.on("text", (text: string) => {
      if (text.trim() === "") return;

      currentElement["#text"] = text;
    });
  }

  async munch(stream: ReadStream) {
    for await (const data of stream) {
      this.parser.write(data);
    }
  }

  async munchString(xml: string) {
    this.parser.write(xml);
  }

  async munchFile(filePath: string) {
    this.munch(
      createReadStream(filePath, {
        encoding: "utf-8",
      })
    );
  }
}
