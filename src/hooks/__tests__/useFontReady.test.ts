import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useFontReady } from "../useFontReady";

describe("useFontReady", () => {
  let checkFn: ReturnType<typeof vi.fn>;
  let loadFn: ReturnType<typeof vi.fn>;
  let readyPromise: Promise<void>;

  beforeEach(() => {
    checkFn = vi.fn().mockReturnValue(true);
    loadFn = vi.fn().mockResolvedValue([]);
    readyPromise = Promise.resolve();

    Object.defineProperty(document, "fonts", {
      value: {
        check: checkFn,
        load: loadFn,
        ready: readyPromise
      },
      writable: true,
      configurable: true
    });
  });

  it("returns true immediately when font is already loaded", () => {
    checkFn.mockReturnValue(true);
    const { result } = renderHook(() => useFontReady("16px Inter"));
    expect(result.current).toBe(true);
  });

  it("returns false initially when font is not loaded, then resolves", async () => {
    let resolveLoad: (v: unknown[]) => void;
    const loadPromise = new Promise<unknown[]>((res) => { resolveLoad = res; });

    checkFn.mockReturnValueOnce(false) // initial state
           .mockReturnValueOnce(false) // effect check
           .mockReturnValue(true);     // after load

    loadFn.mockReturnValue(loadPromise);

    const { result } = renderHook(() => useFontReady("16px Inter"));
    expect(result.current).toBe(false);

    await act(async () => {
      resolveLoad!([]);
      await loadPromise;
      await readyPromise;
    });

    expect(result.current).toBe(true);
  });

  it("handles load failure gracefully", async () => {
    let rejectLoad: (err: Error) => void;
    const loadPromise = new Promise<unknown[]>((_, rej) => { rejectLoad = rej; });

    checkFn.mockReturnValue(false);
    loadFn.mockReturnValue(loadPromise);

    const { result } = renderHook(() => useFontReady("16px Nope"));
    expect(result.current).toBe(false);

    await act(async () => {
      rejectLoad!(new Error("font not found"));
      try { await loadPromise; } catch { /* expected */ }
    });

    expect(result.current).toBe(false);
  });
});
