import { describe, expect, it } from "vitest";

import { lowerBound } from "../../utils/binarySearch";

describe("lowerBound", () => {
  it("finds the first offset not less than the target", () => {
    expect(lowerBound([0, 10, 20, 30], 0)).toBe(0);
    expect(lowerBound([0, 10, 20, 30], 5)).toBe(1);
    expect(lowerBound([0, 10, 20, 30], 20)).toBe(2);
    expect(lowerBound([0, 10, 20, 30], 99)).toBe(4);
  });
});
