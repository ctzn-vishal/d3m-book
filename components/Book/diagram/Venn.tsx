import * as React from 'react';

import { useDiagramId } from './DiagramFrame';
import { SvgText } from './text';
import { S, T } from './tokens';

/**
 * Two or three overlapping sets, with the intersection actually drawn.
 *
 * The reason this is a component rather than three `<circle>` elements: the
 * intersection is the only part of a Venn diagram anyone came for, and the
 * naive rendering destroys it. Three translucent circles at `opacity=0.55` in
 * three different hues make the region where all three overlap the *muddiest*
 * area on the canvas — a brown-grey soup that is darker than everything around
 * it but reads as an artefact rather than a claim. That is exactly what
 * `LethalTrifecta` looked like, and the intersection is the entire point of
 * that figure.
 *
 * Here the circles are near-transparent ink washes carrying no hue at all, and
 * the intersection is drawn *explicitly*, clipped to the region and filled with
 * the accent. Overlap stops being a side effect of alpha blending and becomes a
 * shape the author placed.
 */

export interface VennCircle {
  cx: number;
  cy: number;
  r: number;
  /** Label for the set, placed outside the circle. */
  label: string;
  /** Where the label sits relative to the circle. */
  labelAt?: 'top' | 'bottom' | 'left' | 'right';
  sublabel?: string;
}

export interface VennProps {
  circles: VennCircle[];
  /** Text for the region where every circle overlaps. */
  intersection?: { label: string; sublabel?: string };
  /**
   * Tone for the intersection. `accent` is the default; `neg` when the overlap
   * is the failure mode rather than the goal.
   */
  intersectionTone?: 'accent' | 'neg' | 'pos';
}

export function Venn({ circles, intersection, intersectionTone = 'accent' }: VennProps) {
  const id = useDiagramId();

  const fill =
    intersectionTone === 'neg' ? T.negTint : intersectionTone === 'pos' ? T.posTint : T.accentTint;
  const stroke =
    intersectionTone === 'neg' ? T.neg : intersectionTone === 'pos' ? T.pos : T.accent;

  // Centroid of the circle centres — for 2 and 3 symmetric circles this lands
  // inside the common region, which is all we need it to do.
  const ix = circles.reduce((s, c) => s + c.cx, 0) / circles.length;
  const iy = circles.reduce((s, c) => s + c.cy, 0) / circles.length;

  // For a top-placed label the sublabel goes *above* the circle too, so the
  // pair has to be lifted by its own height first — otherwise the second line
  // lands on the circle's stroke.
  const labelPos = (c: VennCircle) => {
    switch (c.labelAt ?? 'top') {
      case 'bottom':
        return [c.cx, c.cy + c.r + 20];
      case 'left':
        return [c.cx - c.r - 8, c.cy];
      case 'right':
        return [c.cx + c.r + 8, c.cy];
      default:
        return [c.cx, c.cy - c.r - (c.sublabel ? 28 : 14)];
    }
  };

  return (
    <g>
      <defs>
        {circles.map((c, i) => (
          <clipPath key={i} id={`${id}-venn-${i}`}>
            <circle cx={c.cx} cy={c.cy} r={c.r} />
          </clipPath>
        ))}
      </defs>

      {/* The sets themselves: hairline outline, barely-there wash. No hue —
          three coloured sets would be three category colours competing with
          the one thing that is focal. */}
      {circles.map((c, i) => (
        <circle
          key={`c-${i}`}
          cx={c.cx}
          cy={c.cy}
          r={c.r}
          fill={T.paperAlt}
          fillOpacity={0.55}
          stroke={T.muted}
          strokeWidth={S.base}
        />
      ))}

      {/* The common region, built by nesting one clip per circle. */}
      {intersection && (
        <g clipPath={`url(#${id}-venn-0)`}>
          <g clipPath={`url(#${id}-venn-1)`}>
            {circles.length > 2 ? (
              <g clipPath={`url(#${id}-venn-2)`}>
                <circle cx={circles[0].cx} cy={circles[0].cy} r={circles[0].r * 3} fill={fill} />
              </g>
            ) : (
              <circle cx={circles[0].cx} cy={circles[0].cy} r={circles[0].r * 3} fill={fill} />
            )}
          </g>
        </g>
      )}

      {/* Outline the common region so it reads as a drawn shape rather than a
          darker patch of wash. Its boundary is made of one arc from each
          circle, so each circle's stroke is drawn clipped by all the others. */}
      {intersection &&
        circles.map((c, i) => {
          const others = circles.map((_, j) => j).filter(j => j !== i);
          const outline = (
            <circle
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill="none"
              stroke={stroke}
              strokeWidth={S.strong}
            />
          );
          return (
            <g key={`o-${i}`} clipPath={`url(#${id}-venn-${others[0]})`}>
              {others.length > 1 ? (
                <g clipPath={`url(#${id}-venn-${others[1]})`}>{outline}</g>
              ) : (
                outline
              )}
            </g>
          );
        })}

      {circles.map((c, i) => {
        const [lx, ly] = labelPos(c);
        const at = c.labelAt ?? 'top';
        const anchor = at === 'left' ? 'end' : at === 'right' ? 'start' : 'middle';
        return (
          <g key={`l-${i}`}>
            <SvgText x={lx} y={ly} variant="node" tone="ink" textAnchor={anchor} width={c.r * 2}>
              {c.label}
            </SvgText>
            {c.sublabel && (
              <SvgText
                x={lx}
                y={ly + 14}
                variant="sub"
                tone="muted"
                textAnchor={anchor}
                width={c.r * 2}
              >
                {c.sublabel}
              </SvgText>
            )}
          </g>
        );
      })}

      {intersection && (
        <g>
          <SvgText
            x={ix}
            y={iy + (intersection.sublabel ? -2 : 4)}
            variant="node"
            tone={intersectionTone === 'accent' ? 'accent' : intersectionTone}
            width={circles.length > 2 ? 96 : 140}
          >
            {intersection.label}
          </SvgText>
          {intersection.sublabel && (
            <SvgText
              x={ix}
              y={iy + 14}
              variant="sub"
              tone="muted"
              width={circles.length > 2 ? 96 : 140}
            >
              {intersection.sublabel}
            </SvgText>
          )}
        </g>
      )}
    </g>
  );
}
