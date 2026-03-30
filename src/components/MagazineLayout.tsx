import { layoutNextLine, prepareWithSegments } from "@chenglou/pretext";
import { useEffect, useMemo, useRef, useState } from "react";

import type { MagazineLayoutProps } from "../types";
import { useFontReady } from "../hooks/useFontReady";

function parseFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : 16;
}

export function MagazineLayout({
  text,
  columns = 3,
  gap = 24,
  font = "16px Inter",
  lineHeight = parseFontSize(font) * 1.5,
  maxLinesPerColumn = 30,
  className,
  style
}: MagazineLayoutProps) {
  const ready = useFontReady(font);
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const renderedColumns = useMemo(() => {
    if (!ready || width <= 0) {
      return [];
    }

    const columnWidth = (width - gap * (columns - 1)) / columns;
    const prepared = prepareWithSegments(text, font);
    const output: string[][] = Array.from({ length: columns }, () => []);

    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let columnIndex = 0;

    while (columnIndex < columns) {
      const next = layoutNextLine(prepared, cursor, columnWidth);
      if (!next) {
        break;
      }
      output[columnIndex].push(next.text);
      cursor = next.end;

      if (output[columnIndex].length >= maxLinesPerColumn) {
        columnIndex += 1;
      }
    }

    return output;
  }, [columns, font, gap, maxLinesPerColumn, ready, text, width]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap
      }}
    >
      {renderedColumns.map((column, index) => (
        <div key={index} style={{ font, lineHeight: `${lineHeight}px`, whiteSpace: "pre-wrap" }}>
          {column.join("\n")}
        </div>
      ))}
    </div>
  );
}
