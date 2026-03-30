import { createElement } from "react";

import type { PretextBoxProps } from "../types";
import { usePretext } from "../hooks/usePretext";

function parseFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : 16;
}

export function PretextBox({
  text,
  font = "16px Inter",
  maxWidth,
  lineHeight = parseFontSize(font) * 1.5,
  className,
  style,
  as = "div"
}: PretextBoxProps) {
  const measured = usePretext(text, font, maxWidth, lineHeight);

  if (!measured.ready) {
    return null;
  }

  return createElement(as, {
    className,
    style: {
      ...style,
      width: maxWidth,
      height: measured.height,
      font,
      lineHeight: `${lineHeight}px`,
      overflow: "hidden"
    }
  }, text);
}
