import { describe, expect, test } from "vitest";
import XMLMuncher from "../src";

function extractElements(xml: string, query: string) {
  const elements: any[] = [];
  const muncher = new XMLMuncher();

  muncher.on(query, (element) => {
    elements.push(element);
  });

  muncher.munch(xml);

  return elements;
}

const given = (xml: string) => ({
  query: (query: string) => ({
    expect: (result: any) =>
      expect(extractElements(xml, query)).toEqual(result),

    expectError: (error?: string) =>
      expect(() => extractElements(xml, query)).toThrowError(error),
  }),
});

describe("parsing", () => {
  test("Basic empty elements", () =>
    given("<foo />").query("element:foo").expect([null]));

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

describe("stopping", () => {
  test("stopping after n elements", () => {
    /* Input is a list of 5 items, but we only want the first 3. */
    const input =
      "<items><item>1</item><item>2</item><item>3</item><item>4</item><item>5</item></items>";
    const elements: string[] = [];

    const muncher = new XMLMuncher();
    muncher.on("element:item", (item) => {
      elements.push(item);
      if (elements.length >= 3) muncher.stop();
    });

    muncher.munch(input);

    expect(elements).toEqual(["1", "2", "3"]);
  });
});
