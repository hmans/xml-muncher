import { describe, expect, test } from "vitest";
import { XMLMuncher } from "../src/XMLMuncher";

async function extractElements(xml: string, query: string) {
  const elements: any[] = [];
  const muncher = new XMLMuncher();

  muncher.on(query, (element) => {
    elements.push(element);
  });

  await muncher.munch(xml);

  return elements;
}

const given = (xml: string) => ({
  query: (query: string) => ({
    expect: async (result: any) => {
      const elements = await extractElements(xml, query);
      expect(elements).toEqual(result);
    },

    expectError: (error?: string) => {
      expect(async () => {
        await extractElements(xml, query);
      }).rejects.toThrowError(error);
    },
  }),
});

describe("parsing", () => {
  test("Basic empty elements", () =>
    given("<foo />").query("element:foo").expect([{}]));

  test("Elements with text", () =>
    given("<foo>foo</foo>").query("element:foo").expect(["foo"]));

  test("Elements with nested children", () =>
    given("<foo><bar>Hello World</bar></foo>")
      .query("element:foo")
      .expect([{ bar: "Hello World" }]));

  test("Directly selecting the child", () =>
    given("<foo><bar>Hello World</bar></foo>")
      .query("element:bar")
      .expect(["Hello World"]));

  test("Multiple children of the same name", () =>
    given("<items><item>One</item><item>Two</item></items>")
      .query("element:items")
      .expect([{ item: ["One", "Two"] }]));

  test("Mixed text and element children, wHo doEs tHiS?", () =>
    given("<foo>Hello<bar>World</bar></foo>")
      .query("element:foo")
      .expect([{ "#text": "Hello", bar: "World" }]));

  test("Attributes", () =>
    given('<foo bar="baz" />')
      .query("element:foo")
      .expect([{ $bar: "baz" }]));

  test("Attributes with text", () =>
    given('<foo bar="baz">Foo</foo>')
      .query("element:foo")
      .expect([{ "#text": "Foo", $bar: "baz" }]));

  test("Attributes with nested children", () =>
    given('<foo bar="baz"><child>Child</child></foo>')
      .query("element:foo")
      .expect([{ $bar: "baz", child: "Child" }]));
});

describe("error handling", () => {
  test("Invalid XML", () => given("<foo").query("element:foo").expect([]));

  test("Wrongly closed tags", () =>
    given("<foo><bar></foo>")
      .query("element:foo")
      .expectError("mismatched tag"));

  test("Invalid characters", () =>
    given("<💩foo>foo</💩foo>")
      .query("element:foo")
      .expectError("not well-formed (invalid token)"));
});

describe.todo("pausing and resuming");
