import { createReadStream } from "node:fs";
import expat from "node-expat";
import { buffer } from "stream/consumers";

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
    let count = 0;

    this.parser.on("startElement", (element, attributes) => {
      if (element === "job") {
        console.log(count++);
      }
    });

    this.parser.on("endElement", (element) => {});

    const input = createReadStream(filePath, {
      encoding: "utf-8",
    });

    for await (const data of input) {
      this.parser.write(data);
    }
  }
}
