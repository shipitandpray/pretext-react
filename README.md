# @shipitandpray/pretext-react

React hooks and UI primitives for [`@chenglou/pretext`](https://github.com/chenglou/pretext) -- the arithmetic text layout engine that measures text without touching the DOM.

**[View Live Demo](https://shipitandpray.github.io/pretext-react/)**

[![npm](https://img.shields.io/npm/v/@shipitandpray/pretext-react)](https://www.npmjs.com/package/@shipitandpray/pretext-react)
[![license](https://img.shields.io/npm/l/@shipitandpray/pretext-react)](./LICENSE)

## Why this exists

Pretext is fast, but it is intentionally low-level. In a React app you still need to:

- wait for font readiness before measurement
- compute stable text sizing before render
- shrinkwrap bubble dimensions
- virtualize long lists with precomputed heights
- stream text without janking the layout

This package solves all five problems with reusable hooks and components.

## Install

```bash
npm install @shipitandpray/pretext-react @chenglou/pretext react
```

Peer dependencies: `react >=18.0.0` and `@chenglou/pretext >=0.0.3`.

## Quick start

```tsx
import {
  PretextBox,
  PretextBubble,
  StreamingText,
  VirtualList,
  MagazineLayout
} from "@shipitandpray/pretext-react";

function App() {
  return (
    <div>
      {/* Pre-sized text block -- no layout shift */}
      <PretextBox
        text="This block gets its height from Pretext before it renders."
        font="16px Inter"
        maxWidth={360}
      />

      {/* Chat bubble that shrinkwraps to the widest measured line */}
      <PretextBubble
        text="Compact bubble sizing with no getBoundingClientRect."
        align="right"
      />

      {/* Streaming text that re-measures on growth */}
      <StreamingText
        text="Tokens arrive without relying on DOM reflow..."
        font="15px Inter"
        maxWidth={420}
        onHeightChange={(h) => console.log("new height:", h)}
      />

      {/* Virtualized list -- only visible items in the DOM */}
      <VirtualList
        items={messages}
        getText={(m) => m.body}
        renderItem={(m, i) => <div key={i}>{m.body}</div>}
        containerWidth={600}
        viewportHeight={500}
      />

      {/* Magazine-style multi-column text */}
      <MagazineLayout
        text={longArticle}
        columns={3}
        gap={24}
      />
    </div>
  );
}
```

## API Reference

### Hooks

#### `useFontReady(font)`

Returns `true` once `document.fonts` reports the requested font is available.

```ts
function useFontReady(font: string): boolean;
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `font` | `string` | CSS font shorthand, e.g. `"16px Inter"` |

**Returns:** `boolean` -- `false` until the font is loaded, then `true`.

Use this to avoid measuring against fallback fonts. All other hooks in this package call `useFontReady` internally.

---

#### `usePretext(text, font, maxWidth, lineHeight)`

Returns the measured height and line count for a block of text.

```ts
function usePretext(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
): UsePretextResult;

interface UsePretextResult {
  height: number;
  lineCount: number;
  ready: boolean;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string` | The text to measure |
| `font` | `string` | CSS font shorthand |
| `maxWidth` | `number` | Container width in pixels |
| `lineHeight` | `number` | Line height in pixels |

---

#### `usePretextLines(text, font, maxWidth, lineHeight)`

Returns line-level metrics in addition to total height. Useful for shrinkwrapped bubbles, inline overlays, and width-aware annotations.

```ts
function usePretextLines(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
): UsePretextLinesResult;

interface UsePretextLinesResult {
  width: number;        // widest line
  height: number;
  lineCount: number;
  lines: Array<{ text: string; width: number }>;
  ready: boolean;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string` | The text to measure |
| `font` | `string` | CSS font shorthand |
| `maxWidth` | `number` | Container width in pixels |
| `lineHeight` | `number` | Line height in pixels |

---

#### `useVirtualScroll(args)`

Computes the visible range for a premeasured list using binary search. Heights and offsets are memoized separately from the visible range so that scrolling does not trigger re-measurement of all items.

```ts
function useVirtualScroll<T>(args: {
  items: T[];
  getText: (item: T) => string;
  containerWidth: number;
  lineHeight: number;
  font: string;
  itemPadding: number;
  viewportHeight: number;
  scrollTop: number;
  overscan: number;
}): {
  ready: boolean;
  heights: number[];
  offsets: number[];
  totalHeight: number;
  range: VirtualRange;
};

interface VirtualRange {
  start: number;
  end: number;
  offsetTop: number;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `items` | `T[]` | The full list of items |
| `getText` | `(item: T) => string` | Extract text from an item for measurement |
| `containerWidth` | `number` | Width available for text layout |
| `lineHeight` | `number` | Line height in pixels |
| `font` | `string` | CSS font shorthand |
| `itemPadding` | `number` | Extra padding per item in pixels |
| `viewportHeight` | `number` | Visible area height |
| `scrollTop` | `number` | Current scroll offset |
| `overscan` | `number` | Extra items to render above/below the viewport |

---

### Components

#### `<PretextBox />`

Renders a block element whose height is determined by Pretext before paint. No layout shift.

```tsx
<PretextBox
  text="Pre-measured block of text."
  font="16px Inter"
  maxWidth={360}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | -- | Text content |
| `font` | `string` | `"16px Inter"` | CSS font shorthand |
| `maxWidth` | `number` | -- | Container width in pixels |
| `lineHeight` | `number` | `fontSize * 1.5` | Line height in pixels |
| `className` | `string` | -- | CSS class |
| `style` | `CSSProperties` | -- | Inline styles (merged) |
| `as` | `ElementType` | `"div"` | HTML element to render |

---

#### `<PretextBubble />`

Measures the widest line and renders a compact left- or right-aligned chat bubble.

```tsx
<PretextBubble
  text="Shrinkwrapped to the widest measured line."
  align="right"
  backgroundColor="#0084ff"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | -- | Text content |
| `font` | `string` | `"16px Inter"` | CSS font shorthand |
| `maxWidth` | `number` | `400` | Maximum bubble width |
| `lineHeight` | `number` | `fontSize * 1.5` | Line height in pixels |
| `padding` | `{ x: number; y: number }` | `{ x: 16, y: 12 }` | Inner padding |
| `borderRadius` | `number` | `16` | Border radius |
| `align` | `"left" \| "right"` | `"left"` | Alignment (also sets default colors) |
| `backgroundColor` | `string` | auto | Background color |
| `color` | `string` | auto | Text color |
| `className` | `string` | -- | CSS class |
| `style` | `CSSProperties` | -- | Inline styles (merged) |

---

#### `<VirtualList />`

Renders only the visible slice of a long list. Items are measured with Pretext and positioned absolutely. Scrolling only recalculates the visible range, not item heights.

```tsx
<VirtualList
  items={messages}
  getText={(m) => m.body}
  renderItem={(m, i) => <MessageRow key={i} message={m} />}
  containerWidth={600}
  viewportHeight={500}
  overscan={5}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | -- | Full item array |
| `renderItem` | `(item: T, index: number) => ReactNode` | -- | Render function per item |
| `getText` | `(item: T) => string` | -- | Extract text for measurement |
| `containerWidth` | `number` | -- | Width for text layout |
| `viewportHeight` | `number` | -- | Visible area height |
| `font` | `string` | `"16px Inter"` | CSS font shorthand |
| `lineHeight` | `number` | `fontSize * 1.5` | Line height in pixels |
| `itemPadding` | `number` | `16` | Extra padding per item |
| `overscan` | `number` | `5` | Extra items rendered above/below |
| `className` | `string` | -- | CSS class on outer container |
| `style` | `CSSProperties` | -- | Inline styles on outer container |

---

#### `<MagazineLayout />`

Splits long text into balanced columns using Pretext line iteration.

```tsx
<MagazineLayout
  text={longArticle}
  columns={3}
  gap={24}
  maxLinesPerColumn={30}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | -- | Text to distribute across columns |
| `columns` | `number` | `3` | Number of columns |
| `gap` | `number` | `24` | Gap between columns in pixels |
| `font` | `string` | `"16px Inter"` | CSS font shorthand |
| `lineHeight` | `number` | `fontSize * 1.5` | Line height in pixels |
| `maxLinesPerColumn` | `number` | `30` | Max lines before moving to next column |
| `className` | `string` | -- | CSS class |
| `style` | `CSSProperties` | -- | Inline styles (merged) |

---

#### `<StreamingText />`

Re-measures as text grows and notifies a parent when height changes. Ideal for token streaming UIs.

```tsx
<StreamingText
  text={partialResponse}
  font="15px Inter"
  maxWidth={420}
  onHeightChange={(h) => scrollToBottom()}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | -- | Current text (grows over time) |
| `font` | `string` | `"16px Inter"` | CSS font shorthand |
| `maxWidth` | `number` | -- | Container width in pixels |
| `lineHeight` | `number` | `fontSize * 1.5` | Line height in pixels |
| `onHeightChange` | `(height: number) => void` | -- | Called when measured height changes |
| `className` | `string` | -- | CSS class |
| `style` | `CSSProperties` | -- | Inline styles (merged) |

---

## Comparison with alternatives

| Feature | pretext-react | react-virtuoso | react-window |
|---------|:------------:|:--------------:|:------------:|
| Pre-measured heights (no DOM) | Yes | No | No |
| Shrinkwrap bubble sizing | Yes | No | No |
| Streaming text measurement | Yes | No | No |
| Multi-column layout | Yes | No | No |
| Font readiness detection | Yes | No | No |
| Zero `getBoundingClientRect` | Yes | No | No |
| Variable row heights | Yes | Yes | With plugin |
| Bundle size | ~3 KB | ~30 KB | ~6 KB |
| Framework dependency | React 18+ | React 18+ | React 16+ |

## Performance targets

- **Measurement**: front-loaded into memoized hooks; no per-frame layout work.
- **Scroll performance**: visible range recalculation via binary search -- O(log n) per scroll event. Heights are not recomputed on scroll.
- **Virtualization**: only visible items plus overscan buffer exist in the DOM. 1000 items renders ~15 DOM nodes.
- **Streaming**: only the current text content is re-measured, not the whole page.
- **Width changes**: trigger re-layout because wrapped lines change. This is intentional and unavoidable.

## Architectural notes

This package uses Pretext only for measurement. Rendering happens with normal React DOM elements. This keeps the package simple and interoperable with existing CSS and component systems.

The critical rule is: **measure once, render cheaply**. The package avoids:

- `getBoundingClientRect`
- `offsetHeight`
- post-render height correction loops

## Font guidance

Use explicit fonts such as `"16px Inter"` or `"14px IBM Plex Sans"`. Avoid generic stacks like `system-ui` if you care about deterministic measurement between environments.

For the most stable results:

1. Load the font early (preload or `@font-face`).
2. Wait for `useFontReady` to return `true`.
3. Render once the font is available.

## Local development

```bash
npm install
npm run check   # TypeScript type checking
npm run build   # Build with tsup (ESM + CJS + .d.ts)
npm test        # Run tests with Vitest
```

## License

MIT
