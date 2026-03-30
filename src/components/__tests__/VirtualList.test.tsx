import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

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

import { VirtualList } from "../VirtualList";

describe("VirtualList", () => {
  const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
  const renderItem = (item: string, index: number) => (
    <div data-testid={`item-${index}`}>{item}</div>
  );
  const getText = (item: string) => item;

  it("renders only a small subset of 100 items in the DOM", () => {
    const { container } = render(
      <VirtualList
        items={items}
        renderItem={renderItem}
        getText={getText}
        containerWidth={300}
        viewportHeight={400}
        font="16px Inter"
        itemPadding={16}
        overscan={5}
      />
    );

    // Each item = 24 + 16 = 40px. Viewport 400px = 10 visible + 5 overscan = ~15 items
    const renderedItems = container.querySelectorAll("[data-testid]");
    expect(renderedItems.length).toBeLessThan(25);
    expect(renderedItems.length).toBeGreaterThan(0);

    // Total items is 100 but only a fraction appear in the DOM
    expect(renderedItems.length).toBeLessThan(items.length);
  });

  it("positions items absolutely with correct top offsets", () => {
    const { container } = render(
      <VirtualList
        items={items}
        renderItem={renderItem}
        getText={getText}
        containerWidth={300}
        viewportHeight={400}
        font="16px Inter"
        itemPadding={16}
        overscan={0}
      />
    );

    const positioned = container.querySelectorAll<HTMLDivElement>(
      "[data-testid]"
    );
    // First visible item should be at top: 0
    const firstParent = positioned[0]?.parentElement;
    expect(firstParent?.style.top).toBe("0px");

    if (positioned.length > 1) {
      const secondParent = positioned[1]?.parentElement;
      expect(secondParent?.style.top).toBe("40px");
    }
  });

  it("creates a spacer div with the correct total height", () => {
    const { container } = render(
      <VirtualList
        items={items}
        renderItem={renderItem}
        getText={getText}
        containerWidth={300}
        viewportHeight={400}
        font="16px Inter"
        itemPadding={16}
      />
    );

    // The inner spacer div should have height = 100 * 40 = 4000
    const outerDiv = container.firstElementChild as HTMLDivElement;
    const spacerDiv = outerDiv?.firstElementChild as HTMLDivElement;
    expect(spacerDiv.style.height).toBe("4000px");
  });
});
