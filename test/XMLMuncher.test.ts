import { describe, it, expect } from "vitest";
import fs from "fs";
import { XMLMuncher } from "../src/XMLMuncher";
import { buffer } from "stream/consumers";

function extractElements(xml: string, query: string) {
  const elements: any[] = [];
  const muncher = new XMLMuncher();

  muncher.on(query, (element) => {
    elements.push(element);
  });

  muncher.munchString(xml);

  return elements;
}

describe(XMLMuncher, () => {
  it("works", async () => {
    expect(
      extractElements("<foo><bar>Hello World</bar></foo>", "element:foo")
    ).toEqual([{ bar: "Hello World" }]);
  });
});
