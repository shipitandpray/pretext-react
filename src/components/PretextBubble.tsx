import type { CSSProperties } from "react";

import type { PretextBubbleProps } from "../types";
import { usePretextLines } from "../hooks/usePretextLines";

function parseFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : 16;
}

export function PretextBubble({
  text,
  font = "16px Inter",
  maxWidth = 400,
  lineHeight = parseFontSize(font) * 1.5,
  padding = { x: 16, y: 12 },
  borderRadius = 16,
  align = "left",
  backgroundColor,
  color,
  className,
  style
}: PretextBubbleProps) {
  const measured = usePretextLines(text, font, maxWidth - padding.x * 2, lineHeight);

  if (!measured.ready) {
    return null;
  }

  const width = Math.min(maxWidth, measured.width + padding.x * 2);
  const bubbleStyle: CSSProperties = {
    ...style,
    width,
    minHeight: measured.height + padding.y * 2,
    padding: `${padding.y}px ${padding.x}px`,
    borderRadius,
    backgroundColor: backgroundColor ?? (align === "right" ? "#0084ff" : "#f0f0f0"),
    color: color ?? (align === "right" ? "#ffffff" : "#111827"),
    font,
    lineHeight: `${lineHeight}px`,
    alignSelf: align === "right" ? "flex-end" : "flex-start",
    whiteSpace: "pre-wrap"
  };

  return <div className={className} style={bubbleStyle}>{text}</div>;
}
