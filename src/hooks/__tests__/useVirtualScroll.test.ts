import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@chenglou/pretext", () => ({
  prepare: vi.fn(() => ({ mock: true })),
  layout: vi.fn(() => ({ height: 24, lineCount: 1 }))
}));

Object.defineProperty(document, "fonts", {
  value: {
    check: () => true,
    load: () => Promise.resolve([]),
    ready: Promise.resolve()
  },
  writable: true,
  configurable: true
});

import { useVirtualScroll } from "../useVirtualScroll";

const makeItems = (n: number) => Array.from({ length: n }, (_, i) => `Item ${i}`);

describe("useVirtualScroll", () => {
  it("computes heights, offsets, and a visible range", () => {
    const items = makeItems(20);
    const { result } = renderHook(() =>
      useVirtualScroll({
        items,
        getText: (s: string) => s,
        containerWidth: 300,
        lineHeight: 24,
        font: "16px Inter",
        itemPadding: 16,
        viewportHeight: 200,
        scrollTop: 0,
        overscan: 2
      })
    );

    expect(result.current.ready).toBe(true);
    // Each item: height 24 + padding 16 = 40
    expect(result.current.heights).toHaveLength(20);
    expect(result.current.heights[0]).toBe(40);
    expect(result.current.totalHeight).toBe(800); // 20 * 40
    expect(result.current.offsets[0]).toBe(0);
    expect(result.current.offsets[1]).toBe(40);

    // viewport 200 / itemHeight 40 = 5 visible + 2 overscan = 7
    expect(result.current.range.start).toBe(0);
    expect(result.current.range.end).toBeLessThanOrEqual(8);
  });

  it("does not recompute heights when only scrollTop changes", () => {
    const items = makeItems(50);
    const baseArgs = {
      items,
      getText: (s: string) => s,
      containerWidth: 300,
      lineHeight: 24,
      font: "16px Inter",
      itemPadding: 16,
      viewportHeight: 200,
      overscan: 2
    };

    const { result, rerender } = renderHook(
      ({ scrollTop }) => useVirtualScroll({ ...baseArgs, scrollTop }),
      { initialProps: { scrollTop: 0 } }
    );

    const initialHeights = result.current.heights;
    const initialOffsets = result.current.offsets;

    // Scroll down
    rerender({ scrollTop: 200 });

    // Heights and offsets arrays should be referentially identical (same memo)
    expect(result.current.heights).toBe(initialHeights);
    expect(result.current.offsets).toBe(initialOffsets);

    // But the visible range should have changed
    expect(result.current.range.start).toBeGreaterThan(0);
  });

  it("returns empty state when containerWidth is 0", () => {
    const { result } = renderHook(() =>
      useVirtualScroll({
        items: makeItems(10),
        getText: (s: string) => s,
        containerWidth: 0,
        lineHeight: 24,
        font: "16px Inter",
        itemPadding: 16,
        viewportHeight: 200,
        scrollTop: 0,
        overscan: 2
      })
    );

    expect(result.current.heights).toEqual([]);
    expect(result.current.totalHeight).toBe(0);
    expect(result.current.range.start).toBe(0);
    expect(result.current.range.end).toBe(0);
  });
});
