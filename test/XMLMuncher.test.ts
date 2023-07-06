import { describe, expect, it } from "vitest";
import { XMLMuncher } from "../src/XMLMuncher";

async function extractElements(xml: string, query: string) {
  const elements: any[] = [];
  const muncher = new XMLMuncher();

  muncher.on(query, (element) => {
    elements.push(element);
  });

  await muncher.munchString(xml);

  return elements;
}

const extract = (xml: string) => ({
  query: (query: string) => ({
    expect: (result: any) => {
      it("works", async () => {
        const elements = await extractElements(xml, query);
        expect(elements).toEqual(result);
      });
    },
  }),
});

describe(XMLMuncher, () => {
  extract("<foo><bar>Hello World</bar></foo>")
    .query("element:foo")
    .expect([{ bar: "Hello World" }]);

  extract("<foo><bar>Hello World</bar></foo>")
    .query("element:bar")
    .expect(["Hello World"]);

  extract("<items><item>One</item><item>Two</item></items>")
    .query("element:items")
    .expect([{ item: ["One", "Two"] }]);
});
