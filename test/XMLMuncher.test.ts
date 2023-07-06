import { describe, it, expect } from "vitest";

import { XMLMuncher } from "../src/XMLMuncher";

describe(XMLMuncher, () => {
  it("works", () => {
    const muncher = new XMLMuncher();
    muncher.munch("hello");
  });
});
