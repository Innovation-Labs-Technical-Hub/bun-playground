import { test, expect, describe } from "bun:test";
import { slugify } from "../models/tenant.model.ts";

describe("slugify", () => {
  test("converts name to lowercase slug", () => {
    expect(slugify("My Company")).toBe("my-company");
  });

  test("replaces special characters with hyphens", () => {
    expect(slugify("Hello & World!")).toBe("hello-world");
  });

  test("removes leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  test("handles multiple consecutive special chars", () => {
    expect(slugify("a   b   c")).toBe("a-b-c");
  });

  test("preserves numbers", () => {
    expect(slugify("Company 123")).toBe("company-123");
  });

  test("handles already-slugified input", () => {
    expect(slugify("already-a-slug")).toBe("already-a-slug");
  });

  test("handles single word", () => {
    expect(slugify("Hello")).toBe("hello");
  });

  test("handles unicode characters", () => {
    expect(slugify("Café Résumé")).toBe("caf-r-sum");
  });
});
