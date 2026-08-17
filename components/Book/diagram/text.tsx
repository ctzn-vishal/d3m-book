import * as React from 'react';

import { CHAR_W, FONT } from './tokens';

/**
 * Text inside SVG, wrapped with `<tspan>`.
 *
 * The book's diagrams reached for `<foreignObject>` whenever a label needed two
 * lines — ten uses across `Part0Diagrams` and `RagVisionAgentDiagrams`. It
 * works on screen and breaks everywhere else: `foreignObject` carries HTML into
 * the SVG, so the figure stops being a self-contained vector and can't be
 * rasterised or exported without a browser. Since we're assuming static export,
 * it's cheaper to drop it now than to carry it through the redraws.
 *
 * Wrapping is measured, not laid out — we count characters against an average
 * advance width rather than asking the browser. That's approximate for
 * proportional Inter, so `SvgText` errs toward breaking early: a label one word
 * short of the box is invisible, a label one word over is a defect.
 */

export type TextTone = 'ink' | 'subtle' | 'muted' | 'soft' | 'accent' | 'pos' | 'neg' | 'paper';

/** Break `text` into lines that fit `maxWidth` at the given per-char advance. */
export function wrapText(text: string, maxWidth: number, charW: number): string[] {
  const maxChars = Math.max(1, Math.floor(maxWidth / charW));
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Width a label will occupy, snapped up so a mask rect always contains it. */
export function textWidth(text: string, charW: number): number {
  return Math.ceil((text.length * charW) / 4) * 4;
}

export interface SvgTextProps {
  x: number;
  /** Baseline of the **first** line. Pass `block` to centre the run instead. */
  y: number;
  children: string;
  /** Wrap to this width. Omit for a single line. */
  width?: number;
  /** Line height in px. Defaults to a sensible value for the variant. */
  leading?: number;
  /**
   * `first` (default) treats `y` as the first baseline. `middle` centres the
   * whole wrapped block on `y` — what you want inside a node box, where the
   * number of lines isn't known until it wraps.
   */
  anchorY?: 'first' | 'middle';
  variant?: keyof typeof FONT;
  tone?: TextTone;
  textAnchor?: 'start' | 'middle' | 'end';
  className?: string;
}

const TONE_FILL: Record<TextTone, string> = {
  ink: 'fill-body',
  subtle: 'fill-subtle',
  muted: 'fill-muted',
  soft: 'fill-muted/75',
  // Never bare `accent` for text — 3.3:1 on light paper. `accent-ink` is the
  // AA-safe variant and the reason that token exists.
  accent: 'fill-accent-ink',
  pos: 'fill-pos',
  neg: 'fill-neg',
  paper: 'fill-surface',
};

const CHAR_FOR: Record<keyof typeof FONT, number> = {
  node: CHAR_W.node,
  nodeSm: CHAR_W.node * 0.92,
  body: CHAR_W.body,
  sub: CHAR_W.sub,
  eyebrow: CHAR_W.eyebrow,
  arrow: CHAR_W.arrow,
  callout: 6.4,
};

const LEADING_FOR: Record<keyof typeof FONT, number> = {
  node: 14,
  nodeSm: 13,
  body: 13,
  sub: 11,
  eyebrow: 11,
  arrow: 10,
  callout: 16,
};

export function SvgText({
  x,
  y,
  children,
  width,
  leading,
  anchorY = 'first',
  variant = 'node',
  tone = 'ink',
  textAnchor = 'middle',
  className,
}: SvgTextProps) {
  const lh = leading ?? LEADING_FOR[variant];
  const lines = width ? wrapText(children, width, CHAR_FOR[variant]) : [children];
  // Centring a block means lifting it by half the *gaps*, not half the height:
  // the first baseline already sits one cap-height below the block's top.
  const y0 = anchorY === 'middle' ? y - ((lines.length - 1) * lh) / 2 : y;

  return (
    <text
      x={x}
      y={y0}
      textAnchor={textAnchor}
      className={[FONT[variant], TONE_FILL[tone], className].filter(Boolean).join(' ')}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

/** How many lines `text` will take at `width` — for sizing a box to its label. */
export function lineCount(text: string, width: number, variant: keyof typeof FONT = 'node') {
  return wrapText(text, width, CHAR_FOR[variant]).length;
}
