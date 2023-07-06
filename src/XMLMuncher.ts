import { createReadStream } from "node:fs";
import expat from "node-expat";
import { buffer } from "stream/consumers";

type Element = Record<any, any>;

export class XMLMuncher {
  public parser = new expat.Parser("UTF-8");

  constructor() {}

  async munch(xml: string) {
    this.parser.on("startElement", (element, attributes) => {
      console.dir(attributes);
    });

    this.parser.write(xml);
  }

  async munchFile(filePath: string) {
    let currentElement: Element | Element[] = {};
    const stack = new Array<Element>();

    this.parser.on("startElement", (element, attributes) => {
      // console.debug("startElement", element, attributes);

      /* Create a fresh element, full of hopes and dreams */
      const newElement: Element = {};

      if (Array.isArray(currentElement[element])) {
        currentElement[element].push(newElement);
      } else if (currentElement[element]) {
        currentElement[element] = [currentElement[element], newElement];
      } else {
        currentElement[element] = newElement;
      }

      stack.push(currentElement);

      currentElement = newElement;
    });

    this.parser.on("endElement", (element) => {
      // console.debug("endElement", element);
      currentElement = stack.pop()!;

      if (element === "job") console.dir(currentElement, { depth: null });
    });

    const input = createReadStream(filePath, {
      encoding: "utf-8",
    });

    for await (const data of input) {
      this.parser.write(data);
    }
  }
}
