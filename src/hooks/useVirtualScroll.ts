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

  return useMemo(() => {
    if (!ready || containerWidth <= 0 || lineHeight <= 0) {
      return {
        ready,
        heights: [],
        offsets: [],
        totalHeight: 0,
        range: { start: 0, end: 0, offsetTop: 0 }
      };
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
      ready,
      heights,
      offsets,
      totalHeight: total,
      range: {
        start: startIndex,
        end: endIndex,
        offsetTop: offsets[startIndex] ?? 0
      }
    };
  }, [
    containerWidth,
    font,
    getText,
    itemPadding,
    items,
    lineHeight,
    overscan,
    ready,
    scrollTop,
    viewportHeight
  ]);
}
