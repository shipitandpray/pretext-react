import type { CSSProperties, ElementType, ReactNode } from "react";

export interface UsePretextResult {
  height: number;
  lineCount: number;
  ready: boolean;
}

export interface UsePretextLinesResult extends UsePretextResult {
  width: number;
  lines: Array<{ text: string; width: number }>;
}

export interface PretextBoxProps {
  text: string;
  font?: string;
  maxWidth: number;
  lineHeight?: number;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export interface PretextBubbleProps {
  text: string;
  font?: string;
  maxWidth?: number;
  lineHeight?: number;
  padding?: { x: number; y: number };
  borderRadius?: number;
  align?: "left" | "right";
  backgroundColor?: string;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getText: (item: T) => string;
  containerWidth: number;
  viewportHeight: number;
  font?: string;
  lineHeight?: number;
  itemPadding?: number;
  overscan?: number;
  className?: string;
  style?: CSSProperties;
}

export interface MagazineLayoutProps {
  text: string;
  columns?: number;
  gap?: number;
  font?: string;
  lineHeight?: number;
  maxLinesPerColumn?: number;
  className?: string;
  style?: CSSProperties;
}

export interface StreamingTextProps {
  text: string;
  font?: string;
  maxWidth: number;
  lineHeight?: number;
  onHeightChange?: (height: number) => void;
  className?: string;
  style?: CSSProperties;
}

export interface VirtualRange {
  start: number;
  end: number;
  offsetTop: number;
}
