import { useEffect } from "react";

import type { StreamingTextProps } from "../types";
import { usePretext } from "../hooks/usePretext";

function parseFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : 16;
}

export function StreamingText({
  text,
  font = "16px Inter",
  maxWidth,
  lineHeight = parseFontSize(font) * 1.5,
  onHeightChange,
  className,
  style
}: StreamingTextProps) {
  const measured = usePretext(text, font, maxWidth, lineHeight);

  useEffect(() => {
    if (measured.ready) {
      onHeightChange?.(measured.height);
    }
  }, [measured.height, measured.ready, onHeightChange]);

  if (!measured.ready) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        width: maxWidth,
        minHeight: measured.height,
        font,
        lineHeight: `${lineHeight}px`,
        whiteSpace: "pre-wrap"
      }}
    >
      {text}
      <span aria-hidden="true">|</span>
    </div>
  );
}
