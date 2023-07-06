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

const test = (name: string) => ({
  with: (xml: string) => ({
    query: (query: string) => ({
      expect: (result: any) => {
        it(name, async () => {
          const elements = await extractElements(xml, query);
          expect(elements).toEqual(result);
        });
      },

      expectError: (error?: string) => {
        it(name, () => {
          expect(async () => {
            await extractElements(xml, query);
          }).rejects.toThrowError(error);
        });
      },
    }),
  }),
});

describe(XMLMuncher, () => {
  test("Basic empty elements")
    .with("<foo />")
    .query("element:foo")
    .expect([{}]);

  test("Elements with text")
    .with("<foo>foo</foo>")
    .query("element:foo")
    .expect(["foo"]);

  test("Elements with nested children")
    .with("<foo><bar>Hello World</bar></foo>")
    .query("element:foo")
    .expect([{ bar: "Hello World" }]);

  test("Directly selecting the child")
    .with("<foo><bar>Hello World</bar></foo>")
    .query("element:bar")
    .expect(["Hello World"]);

  test("Multiple children of the same name")
    .with("<items><item>One</item><item>Two</item></items>")
    .query("element:items")
    .expect([{ item: ["One", "Two"] }]);

  test("Mixed text and element children, wHo doEs tHiS?")
    .with("<foo>Hello<bar>World</bar></foo>")
    .query("element:foo")
    .expect([{ "#text": "Hello", bar: "World" }]);

  test("Attributes")
    .with('<foo bar="baz" />')
    .query("element:foo")
    .expect([{ $bar: "baz" }]);

  test("Attributes with text")
    .with('<foo bar="baz">Foo</foo>')
    .query("element:foo")
    .expect([{ "#text": "Foo", $bar: "baz" }]);

  test("Attributes with nested children")
    .with('<foo bar="baz"><child>Child</child></foo>')
    .query("element:foo")
    .expect([{ $bar: "baz", child: "Child" }]);

  /* Error handling */

  test("Invalid XML").with("<foo").query("element:foo").expect([]);

  test("Wrongly closed tags")
    .with("<foo><bar></foo>")
    .query("element:foo")
    .expectError("mismatched tag");

  test("Invalid characters")
    .with("<💩foo>foo</💩foo>")
    .query("element:foo")
    .expectError("not well-formed (invalid token)");
});
