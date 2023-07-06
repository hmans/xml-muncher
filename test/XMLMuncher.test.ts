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
  /* Basic empty elements */
  extract("<foo />").query("element:foo").expect([{}]);

  /* Elements with text */
  extract("<foo>foo</foo>").query("element:foo").expect(["foo"]);

  /* Elements with nested children */
  extract("<foo><bar>Hello World</bar></foo>")
    .query("element:foo")
    .expect([{ bar: "Hello World" }]);

  /* Directly selecting the child */
  extract("<foo><bar>Hello World</bar></foo>")
    .query("element:bar")
    .expect(["Hello World"]);

  /* Multiple children of the same name */
  extract("<items><item>One</item><item>Two</item></items>")
    .query("element:items")
    .expect([{ item: ["One", "Two"] }]);

  /* Mixed text and element children, wHo doEs tHiS? */
  extract("<foo>Hello<bar>World</bar></foo>")
    .query("element:foo")
    .expect([{ "#text": "Hello", bar: "World" }]);
});
