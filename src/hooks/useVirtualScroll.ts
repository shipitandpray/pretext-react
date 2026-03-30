import { layout, prepare } from "@chenglou/pretext";
import { useMemo } from "react";

import type { VirtualRange } from "../types";
import { lowerBound } from "../utils/binarySearch";
import { useFontReady } from "./useFontReady";

interface UseVirtualScrollArgs<T> {
  items: T[];
  getText: (item: T) => string;
  containerWidth: number;
  lineHeight: number;
  font: string;
  itemPadding: number;
  viewportHeight: number;
  scrollTop: number;
  overscan: number;
}

export function useVirtualScroll<T>({
  items,
  getText,
  containerWidth,
  lineHeight,
  font,
  itemPadding,
  viewportHeight,
  scrollTop,
  overscan
}: UseVirtualScrollArgs<T>): {
  ready: boolean;
  heights: number[];
  offsets: number[];
  totalHeight: number;
  range: VirtualRange;
} {
  const ready = useFontReady(font);

  // Heights and offsets only depend on items/font/width -- NOT scrollTop.
  // This avoids re-measuring every item on every scroll event.
  const { heights, offsets, totalHeight } = useMemo(() => {
    if (!ready || containerWidth <= 0 || lineHeight <= 0) {
      return { heights: [] as number[], offsets: [] as number[], totalHeight: 0 };
    }

    const heights = items.map((item) => {
      const measured = layout(prepare(getText(item), font), containerWidth, lineHeight);
      return measured.height + itemPadding;
    });

    const offsets: number[] = [];
    let total = 0;
    for (const height of heights) {
      offsets.push(total);
      total += height;
    }

    return { heights, offsets, totalHeight: total };
  }, [containerWidth, font, getText, itemPadding, items, lineHeight, ready]);

  // Visible range depends on scrollTop/viewportHeight but reuses cached heights.
  const range = useMemo<VirtualRange>(() => {
    if (offsets.length === 0) {
      return { start: 0, end: 0, offsetTop: 0 };
    }

    const startIndex = Math.max(0, lowerBound(offsets, Math.max(0, scrollTop)) - overscan);
    const endEdge = scrollTop + viewportHeight;
    let endIndex = Math.min(
      items.length,
      lowerBound(offsets, endEdge) + overscan + 1
    );
    if (endIndex < startIndex) {
      endIndex = startIndex;
    }

    return {
      start: startIndex,
      end: endIndex,
      offsetTop: offsets[startIndex] ?? 0
    };
  }, [offsets, items.length, scrollTop, viewportHeight, overscan]);

  return { ready, heights, offsets, totalHeight, range };
}
