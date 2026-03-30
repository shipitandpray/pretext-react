import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";
import { useMemo } from "react";

import type { UsePretextLinesResult } from "../types";
import { useFontReady } from "./useFontReady";

export function usePretextLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
): UsePretextLinesResult {
  const ready = useFontReady(font);

  return useMemo(() => {
    if (!ready || maxWidth <= 0 || lineHeight <= 0) {
      return { width: 0, height: 0, lineCount: 0, lines: [], ready };
    }

    const prepared = prepareWithSegments(text, font);
    const result = layoutWithLines(prepared, maxWidth, lineHeight);
    const width = result.lines.reduce((max, line) => Math.max(max, line.width), 0);

    return {
      width,
      height: result.height,
      lineCount: result.lineCount,
      lines: result.lines.map((line) => ({ text: line.text, width: line.width })),
      ready
    };
  }, [font, lineHeight, maxWidth, ready, text]);
}
