import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  MagazineLayout,
  PretextBox,
  PretextBubble,
  StreamingText,
  VirtualList
} from "./dist/index.js";

const e = React.createElement;

function Section({ title, eyebrow, children }) {
  return e("section", { className: "card" }, [
    e("div", { key: "eyebrow", className: "eyebrow" }, eyebrow),
    e("h2", { key: "title" }, title),
    children
  ]);
}

function DemoApp() {
  const [streamingText, setStreamingText] = useState("");
  const fullText = "Pretext lets React know the height of this copy before the browser has to guess, which keeps streaming interfaces stable even when the text keeps growing.";

  useEffect(() => {
    let frame = 0;
    const timer = setInterval(() => {
      frame += 3;
      setStreamingText(fullText.slice(0, frame));
      if (frame >= fullText.length) {
        clearInterval(timer);
      }
    }, 55);
    return () => clearInterval(timer);
  }, []);

  const items = useMemo(() => Array.from({ length: 180 }, (_, index) => ({
    id: index,
    text: `Row ${index + 1}: a longish activity item that can wrap differently depending on width and still stay fast because the list works from precomputed heights.`
  })), []);

  return e("main", { className: "page" }, [
    e("header", { key: "hero", className: "hero" }, [
      e("p", { key: "eyebrow", className: "eyebrow" }, "GitHub Pages demo"),
      e("h1", { key: "title" }, "@shipitandpray/pretext-react"),
      e("p", { key: "body", className: "lede" }, "Hooks and components for stable text layout, shrinkwrapped UI, and large virtualized lists powered by Pretext."),
      e("div", { key: "meta", className: "pill-row" }, [
        e("span", { key: "a", className: "pill" }, "React"),
        e("span", { key: "b", className: "pill" }, "Pretext"),
        e("span", { key: "c", className: "pill" }, "No DOM measurement loop")
      ])
    ]),
    e("div", { key: "grid", className: "grid" }, [
      e(Section, {
        key: "box",
        eyebrow: "Measured block",
        title: "PretextBox computes height first"
      }, e(PretextBox, {
        text: "This block renders at a stable height because Pretext measured the wrapped lines before React painted the container.",
        font: "16px Inter",
        maxWidth: 360,
        style: { color: "#dbeafe" }
      })),
      e(Section, {
        key: "bubble",
        eyebrow: "Shrinkwrap",
        title: "PretextBubble matches the content"
      }, e("div", { className: "bubble-stack" }, [
        e(PretextBubble, {
          key: "left",
          text: "A compact assistant bubble.",
          backgroundColor: "#1f2937",
          style: { color: "#f9fafb" }
        }),
        e(PretextBubble, {
          key: "right",
          text: "A wider user bubble that still shrinkwraps to its measured line width instead of taking the full row.",
          align: "right",
          backgroundColor: "#0f766e",
          style: { color: "#ecfeff" }
        })
      ])),
      e(Section, {
        key: "streaming",
        eyebrow: "Streaming copy",
        title: "StreamingText reports height changes"
      }, e(StreamingText, {
        text: streamingText,
        font: "16px Inter",
        maxWidth: 360,
        style: { color: "#fef3c7" }
      })),
      e(Section, {
        key: "magazine",
        eyebrow: "Editorial layout",
        title: "MagazineLayout splits long copy into columns"
      }, e(MagazineLayout, {
        text: "Pretext is well suited to dense editorial copy because line breaking can happen without waiting for layout thrash. This demo keeps the visual style simple, but the useful part is that a React component can decide the final block height before the browser starts correcting itself after paint.",
        columns: 2,
        gap: 20,
        font: "15px Inter",
        lineHeight: 24
      })),
      e("section", { key: "list", className: "card card-wide" }, [
        e("div", { key: "eyebrow", className: "eyebrow" }, "Virtualization"),
        e("h2", { key: "title" }, "VirtualList renders only the visible slice"),
        e("div", { key: "list-shell", className: "list-shell" }, e(VirtualList, {
          items,
          getText: (item) => item.text,
          renderItem: (item) => e("div", { className: "row-card" }, item.text),
          containerWidth: 520,
          viewportHeight: 320,
          font: "15px Inter",
          lineHeight: 22,
          itemPadding: 16,
          overscan: 4
        }))
      ])
    ])
  ]);
}

createRoot(document.getElementById("app")).render(e(DemoApp));
