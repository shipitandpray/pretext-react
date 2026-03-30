import { layout, prepare } from "@chenglou/pretext";
import { useMemo } from "react";

import type { UsePretextResult } from "../types";
import { useFontReady } from "./useFontReady";

export function usePretext(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
): UsePretextResult {
  const ready = useFontReady(font);

  return useMemo(() => {
    if (!ready || maxWidth <= 0 || lineHeight <= 0) {
      return { height: 0, lineCount: 0, ready };
    }

    const prepared = prepare(text, font);
    const result = layout(prepared, maxWidth, lineHeight);
    return {
      height: result.height,
      lineCount: result.lineCount,
      ready
    };
  }, [font, lineHeight, maxWidth, ready, text]);
}
