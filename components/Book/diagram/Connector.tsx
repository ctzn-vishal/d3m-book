'use client';

import * as React from 'react';

import { useMarker } from './DiagramFrame';
import { connectorPath, midRun, type ConnectorPathOptions, type Pt, type Route } from './path';
import { S, toneStroke, type Tone } from './tokens';
import { ArrowLabel, type LabelSide } from './ArrowLabel';

/**
 * An arrow between two points, bent only at right angles.
 *
 * Draw connectors **before** nodes so z-order puts the lines behind the boxes.
 * That is not a style preference — it's what lets a node's opaque mask clip a
 * line that would otherwise emerge from under its border.
 */

export interface ConnectorProps extends ConnectorPathOptions {
  from: Pt;
  to: Pt;
  route?: Route;
  tone?: Tone;
  /** Optional, async, return, or passive flows. */
  dashed?: boolean;
  /** `end` (default), `both`, or `none`. */
  arrow?: 'end' | 'both' | 'none';
  strokeWidth?: number;
  /**
   * Annotation on the arrow. Placed on the middle run with a 6–10px gap, never
   * on the stroke itself — a label that hides its own connector is a hard fail,
   * and it was the second-most common defect in the book's flow diagrams.
   */
  label?: string;
  /** Which side of the line the label sits on. Defaults by route. */
  labelSide?: LabelSide;
  /** Nudge the label along the run, when the default midpoint collides. */
  labelOffset?: number;
}

export function Connector({
  from,
  to,
  route = 'hvh',
  tone = 'default',
  dashed,
  arrow = 'end',
  strokeWidth,
  label,
  labelSide,
  labelOffset = 0,
  r,
  mid,
  hops,
}: ConnectorProps) {
  const marker = useMarker();
  const d = connectorPath(from, to, { route, r, mid, hops });

  // A vertical middle run wants its label beside it; a horizontal one wants it
  // above. Getting this wrong is how labels end up sitting on the line.
  const verticalRun = route === 'hvh' || (route === 'straight' && from[0] === to[0]) || route === 'vh';
  const side: LabelSide = labelSide ?? (verticalRun ? 'right' : 'above');

  const [lx, ly] = midRun(from, to, route, mid);

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={toneStroke[tone]}
        strokeWidth={strokeWidth ?? (tone === 'accent' ? S.strong : S.base)}
        strokeDasharray={dashed ? '4 3' : undefined}
        strokeLinecap="round"
        markerEnd={arrow === 'none' ? undefined : marker(tone)}
        markerStart={arrow === 'both' ? marker(tone) : undefined}
      />
      {label && (
        <ArrowLabel
          x={side === 'above' || side === 'below' ? lx + labelOffset : lx}
          y={side === 'above' || side === 'below' ? ly : ly + labelOffset}
          side={side}
          tone={tone === 'accent' ? 'accent' : 'muted'}
        >
          {label}
        </ArrowLabel>
      )}
    </g>
  );
}

/**
 * A connector expressed as a raw path, for the handful of shapes the route
 * vocabulary doesn't cover — a loop's arc, a self-transition, a curve that is
 * genuinely a curve rather than a badly-routed line.
 *
 * Reach for `Connector` first. If you're passing a straight diagonal here to
 * dodge the elbow rule, the layout is wrong, not the rule.
 */
export function PathConnector({
  d,
  tone = 'default',
  dashed,
  arrow = 'end',
  strokeWidth,
}: {
  d: string;
  tone?: Tone;
  dashed?: boolean;
  arrow?: 'end' | 'both' | 'none';
  strokeWidth?: number;
}) {
  const marker = useMarker();
  return (
    <path
      d={d}
      fill="none"
      stroke={toneStroke[tone]}
      strokeWidth={strokeWidth ?? (tone === 'accent' ? S.strong : S.base)}
      strokeDasharray={dashed ? '4 3' : undefined}
      strokeLinecap="round"
      markerEnd={arrow === 'none' ? undefined : marker(tone)}
      markerStart={arrow === 'both' ? marker(tone) : undefined}
    />
  );
}
