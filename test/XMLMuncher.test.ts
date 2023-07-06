import { describe, it, expect } from "vitest";
import fs from "fs";
import { XMLMuncher } from "../src/XMLMuncher";
import { buffer } from "stream/consumers";

describe(XMLMuncher, () => {
  it("works", async () => {
    const elements: any[] = [];
    const muncher = new XMLMuncher();

    muncher.on("element:foo", (element) => {
      elements.push(element);
    });

    muncher.munchString("<foo><bar>Hello World</bar></foo>");

    expect(elements).toEqual([{ bar: "Hello World" }]);
  });
});
