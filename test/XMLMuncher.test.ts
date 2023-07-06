import { describe, expect, it } from "vitest";
import { XMLMuncher } from "../src/XMLMuncher";

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
  it("correctly extracts elements", async () => {
    expect(
      extractElements("<foo><bar>Hello World</bar></foo>", "element:foo")
    ).toEqual([{ bar: "Hello World" }]);
  });
});
