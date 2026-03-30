import type { UIEvent } from "react";
import { useMemo, useState } from "react";

import { useVirtualScroll } from "../hooks/useVirtualScroll";
import type { VirtualListProps } from "../types";

function parseFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : 16;
}

export function VirtualList<T>({
  items,
  renderItem,
  getText,
  containerWidth,
  viewportHeight,
  font = "16px Inter",
  lineHeight = parseFontSize(font) * 1.5,
  itemPadding = 16,
  overscan = 5,
  className,
  style
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const { ready, offsets, heights, totalHeight, range } = useVirtualScroll({
    items,
    getText,
    containerWidth,
    lineHeight,
    font,
    itemPadding,
    viewportHeight,
    scrollTop,
    overscan
  });

  const visibleItems = useMemo(
    () => items.slice(range.start, range.end),
    [items, range.end, range.start]
  );

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return (
    <div
      className={className}
      style={{
        ...style,
        position: "relative",
        overflowY: "auto",
        height: viewportHeight
      }}
      onScroll={handleScroll}
    >
      <div style={{ position: "relative", height: totalHeight }}>
        {ready &&
          visibleItems.map((item, index) => {
            const actualIndex = range.start + index;
            return (
              <div
                key={actualIndex}
                style={{
                  position: "absolute",
                  top: offsets[actualIndex] ?? 0,
                  left: 0,
                  right: 0,
                  height: heights[actualIndex] ?? undefined
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
      </div>
    </div>
  );
}
