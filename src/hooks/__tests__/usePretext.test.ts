import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@chenglou/pretext", () => ({
  prepare: vi.fn((_text: string, _font: string) => ({ mock: true })),
  layout: vi.fn(() => ({ height: 48, lineCount: 2 }))
}));

// Mock document.fonts so useFontReady returns true immediately
Object.defineProperty(document, "fonts", {
  value: {
    check: () => true,
    load: () => Promise.resolve([]),
    ready: Promise.resolve()
  },
  writable: true
});

import { usePretext } from "../usePretext";
import { prepare, layout } from "@chenglou/pretext";

describe("usePretext", () => {
  it("returns measured height and lineCount when ready", () => {
    const { result } = renderHook(() =>
      usePretext("Hello world", "16px Inter", 300, 24)
    );

    expect(result.current.ready).toBe(true);
    expect(result.current.height).toBe(48);
    expect(result.current.lineCount).toBe(2);
    expect(prepare).toHaveBeenCalledWith("Hello world", "16px Inter");
    expect(layout).toHaveBeenCalled();
  });

  it("returns zeros when maxWidth is non-positive", () => {
    const { result } = renderHook(() =>
      usePretext("Hello", "16px Inter", 0, 24)
    );

    expect(result.current.height).toBe(0);
    expect(result.current.lineCount).toBe(0);
  });

  it("returns zeros when lineHeight is non-positive", () => {
    const { result } = renderHook(() =>
      usePretext("Hello", "16px Inter", 300, 0)
    );

    expect(result.current.height).toBe(0);
    expect(result.current.lineCount).toBe(0);
  });

  it("memoizes result across re-renders with same args", () => {
    const { result, rerender } = renderHook(
      ({ text }) => usePretext(text, "16px Inter", 300, 24),
      { initialProps: { text: "Hello" } }
    );

    const first = result.current;
    rerender({ text: "Hello" });
    expect(result.current).toBe(first);
  });
});
