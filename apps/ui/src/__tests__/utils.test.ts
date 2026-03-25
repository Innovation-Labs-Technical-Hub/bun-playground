import { test, expect, describe } from "bun:test";
import { cn } from "../lib/utils.ts";

describe("cn (class name utility)", () => {
  test("merges class names", () => {
    const result = cn("foo", "bar");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
  });

  test("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "visible");
    expect(result).toContain("base");
    expect(result).toContain("visible");
    expect(result).not.toContain("hidden");
  });

  test("handles undefined and null", () => {
    const result = cn("base", undefined, null);
    expect(result).toBe("base");
  });

  test("deduplicates tailwind classes", () => {
    const result = cn("p-4", "p-2");
    // tailwind-merge should keep the last conflicting class
    expect(result).toContain("p-2");
    expect(result).not.toContain("p-4");
  });
});
