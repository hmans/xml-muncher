import expat from "node-expat";
import EventEmitter from "node:events";
import { createReadStream } from "node:fs";

type Element = Record<string, any>;

export class XMLMuncher extends EventEmitter {
  public parser = new expat.Parser("UTF-8");

  async munchFile(filePath: string) {
    let currentElement: Element = {};
    const stack = new Array<Element>();

    this.parser.on("startElement", (element, attributes) => {
      /* Create a fresh element, full of hopes and dreams */
      stack.push(currentElement);
      currentElement = {};
    });

    this.parser.on("endElement", (element) => {
      let newElement: Element | string = currentElement;
      currentElement = stack.pop()!;

      /* Process element */
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

      this.emit(`element:${element}`, newElement);
    });

    this.parser.on("text", (text: string) => {
      if (text.trim() === "") return;

      currentElement["#text"] = text;
    });

    const input = createReadStream(filePath, {
      encoding: "utf-8",
    });

    for await (const data of input) {
      this.parser.write(data);
    }
  }
}
