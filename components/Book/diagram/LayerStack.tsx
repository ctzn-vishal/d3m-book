import * as React from 'react';

import { SvgText } from './text';
import { R, S, T } from './tokens';

/**
 * Stacked abstraction levels — full-width bands, one per layer.
 *
 * The band is doing real work: every layer is the *same width* and the *same
 * height*, which is what says "these are peers at different levels" rather than
 * "these are five things of varying importance". Varying the widths turns a
 * layer stack into a funnel, which means something else entirely.
 *
 * Three fields per band, left to right: an index tag, the layer name, and a
 * note. Alternating fills OR hairline dividers — pick one and hold it; both at
 * once reads as a table that lost its header.
 *
 * Budget: 4–6 layers. If the subject has eight, two of them are the same layer.
 */

export interface LayerSpec {
  /** Far-left eyebrow: `L3`, `07`, `RAW`. Keep it to four characters or so. */
  tag?: string;
  name: string;
  /** Second line under the name — the language, the tool, the mechanism. */
  sub?: string;
  /** Far-right note — what the layer buys you, or what it costs. */
  note?: string;
  /** The one layer under discussion. At most one per stack. */
  focal?: boolean;
}

export interface LayersProps {
  x: number;
  y: number;
  width: number;
  layers: LayerSpec[];
  /** Band height. 56–72 reads best; below 48 the three fields crowd. */
  rowHeight?: number;
  /**
   * Label for the direction the stack runs, drawn in the left margin outside
   * the bands — `abstraction ↑`, `raw → refined ↓`. Omit if the order is
   * self-evident from the names.
   */
  direction?: string;
  /** Set when `direction` reads downward. */
  directionDown?: boolean;
}

export function Layers({
  x,
  y,
  width,
  layers,
  rowHeight = 60,
  direction,
  directionDown,
}: LayersProps) {
  const total = layers.length * rowHeight;

  return (
    <g>
      {direction && (
        <g>
          <line
            x1={x - 20}
            y1={y + 12}
            x2={x - 20}
            y2={y + total - 12}
            stroke={T.ruleStrong}
            strokeWidth={S.thin}
          />
          {/* Arrowhead drawn by hand rather than via a marker: the marker set
              is sized for connectors, and this is a margin annotation. */}
          <polygon
            points={
              directionDown
                ? `${x - 24},${y + total - 20} ${x - 16},${y + total - 20} ${x - 20},${y + total - 10}`
                : `${x - 24},${y + 20} ${x - 16},${y + 20} ${x - 20},${y + 10}`
            }
            fill={T.ruleStrong}
          />
          <SvgText
            x={-(y + total / 2)}
            y={x - 28}
            variant="eyebrow"
            tone="soft"
            className="[transform:rotate(-90deg)]"
          >
            {direction}
          </SvgText>
        </g>
      )}

      {layers.map((layer, i) => {
        const ly = y + i * rowHeight;
        return (
          <g key={layer.name}>
            <rect
              x={x}
              y={ly}
              width={width}
              height={rowHeight}
              fill={layer.focal ? T.accentTint : i % 2 === 0 ? T.paper : T.paperAlt}
            />
            {layer.focal && (
              <rect
                x={x}
                y={ly}
                width={width}
                height={rowHeight}
                fill="none"
                stroke={T.accent}
                strokeWidth={S.strong}
              />
            )}
            {i > 0 && !layer.focal && (
              <line x1={x} y1={ly} x2={x + width} y2={ly} stroke={T.rule} strokeWidth={S.thin} />
            )}
            {layer.tag && (
              <SvgText
                x={x + 16}
                y={ly + rowHeight / 2 + 3}
                variant="eyebrow"
                tone={layer.focal ? 'accent' : 'soft'}
                textAnchor="start"
              >
                {layer.tag}
              </SvgText>
            )}
            <SvgText
              x={x + 96}
              y={ly + rowHeight / 2 + (layer.sub ? -1 : 4)}
              width={width * 0.42}
              anchorY="middle"
              variant="node"
              tone={layer.focal ? 'accent' : 'ink'}
              textAnchor="start"
            >
              {layer.name}
            </SvgText>
            {layer.sub && (
              <SvgText
                x={x + 96}
                y={ly + rowHeight / 2 + 14}
                width={width * 0.42}
                variant="sub"
                tone="muted"
                textAnchor="start"
              >
                {layer.sub}
              </SvgText>
            )}
            {layer.note && (
              <SvgText
                x={x + width - 16}
                y={ly + rowHeight / 2 + 3}
                width={width * 0.44}
                anchorY="middle"
                variant="sub"
                tone="muted"
                textAnchor="end"
              >
                {layer.note}
              </SvgText>
            )}
          </g>
        );
      })}

      {/* Outer silhouette last, so it sits above the band fills. */}
      <rect
        x={x}
        y={y}
        width={width}
        height={total}
        rx={R.lg}
        fill="none"
        stroke={T.ruleStrong}
        strokeWidth={S.base}
      />
    </g>
  );
}
