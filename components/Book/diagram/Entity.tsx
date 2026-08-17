import * as React from 'react';

import { Mask } from './DiagramFrame';
import { SvgText } from './text';
import { R, S, T } from './tokens';
import type { NodeVariant } from './Node';

/**
 * A table in an ER / data-model diagram: a header with the entity name, and a
 * field list under it.
 *
 * The field list is the point. A box labelled "Customers" with no columns is a
 * node in an architecture diagram, not an entity — if the reader can't see
 * which key joins to which, the diagram isn't answering the question an ER
 * diagram exists to answer.
 *
 * Notation, kept consistent because inconsistent cardinality between the two
 * ends of one relationship is the classic ER defect:
 *
 * - `#` prefixes a primary key
 * - `→` prefixes a foreign key
 * - cardinality (`1`, `N`, `0..1`) sits 10–12px off the entity edge
 */

export const ENTITY_HEADER = 28;
export const ENTITY_ROW = 16;

export interface Field {
  name: string;
  /** `pk` renders `#`, `fk` renders `→`. */
  key?: 'pk' | 'fk';
  /** Type or note, right-aligned. Keep it short — `int`, `date`, `1 per store`. */
  note?: string;
}

export interface EntityProps {
  x: number;
  y: number;
  width: number;
  name: string;
  fields: Field[];
  /** `focal` marks the aggregate root — the fact table everything hangs off. */
  variant?: Extract<NodeVariant, 'focal' | 'step' | 'store' | 'external' | 'neg'>;
  /** Short uppercase kind, e.g. `FACT`, `DIM`. Omit when it adds nothing. */
  tag?: string;
}

/** Total height an entity will occupy — for laying out before you draw. */
export function entityHeight(fieldCount: number) {
  return ENTITY_HEADER + fieldCount * ENTITY_ROW + 8;
}

const STROKE: Record<NonNullable<EntityProps['variant']>, string> = {
  focal: T.accent,
  step: T.ink,
  store: T.muted,
  external: T.ruleStrong,
  neg: T.neg,
};

const HEADER_FILL: Record<NonNullable<EntityProps['variant']>, string> = {
  focal: T.accentTint,
  step: T.paperAlt,
  store: T.paperAlt,
  external: T.paperAlt,
  neg: T.negTint,
};

export function Entity({ x, y, width, name, fields, variant = 'step', tag }: EntityProps) {
  const h = entityHeight(fields.length);
  const stroke = STROKE[variant];
  const tone = variant === 'focal' ? 'accent' : variant === 'neg' ? 'neg' : 'ink';

  return (
    <g>
      <Mask x={x} y={y} width={width} height={h} rx={R.md} />
      <rect
        x={x}
        y={y}
        width={width}
        height={h}
        rx={R.md}
        fill={T.paper}
        stroke={stroke}
        strokeWidth={variant === 'focal' ? S.strong : S.base}
      />
      {/* Header band. Clipped to the box so its square corners don't poke
          out of the rounded top. */}
      <clipPath id={`${name.replace(/\W/g, '')}-clip`}>
        <rect x={x} y={y} width={width} height={h} rx={R.md} />
      </clipPath>
      <g clipPath={`url(#${name.replace(/\W/g, '')}-clip)`}>
        <rect x={x} y={y} width={width} height={ENTITY_HEADER} fill={HEADER_FILL[variant]} />
      </g>
      <line
        x1={x}
        y1={y + ENTITY_HEADER}
        x2={x + width}
        y2={y + ENTITY_HEADER}
        stroke={stroke}
        strokeWidth={S.thin}
        strokeOpacity={0.6}
      />
      <SvgText x={x + 10} y={y + 18} variant="node" tone={tone} textAnchor="start">
        {name}
      </SvgText>
      {tag && (
        <SvgText x={x + width - 10} y={y + 18} variant="eyebrow" tone="soft" textAnchor="end">
          {tag}
        </SvgText>
      )}

      {fields.map((f, i) => {
        const fy = y + ENTITY_HEADER + 12 + i * ENTITY_ROW;
        const prefix = f.key === 'pk' ? '# ' : f.key === 'fk' ? '→ ' : '';
        return (
          <g key={f.name}>
            <SvgText
              x={x + 10}
              y={fy}
              variant="sub"
              tone={f.key ? 'ink' : 'muted'}
              textAnchor="start"
            >
              {prefix + f.name}
            </SvgText>
            {f.note && (
              <SvgText x={x + width - 10} y={fy} variant="sub" tone="soft" textAnchor="end">
                {f.note}
              </SvgText>
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Cardinality marker — the `1` or `N` that sits just off an entity's edge.
 *
 * Both ends of a relationship must carry one. A line with `N` at one end and
 * nothing at the other doesn't say "one to many"; it says the author stopped
 * halfway.
 */
export function Cardinality({
  x,
  y,
  children,
  tone = 'muted',
}: {
  x: number;
  y: number;
  children: string;
  tone?: 'muted' | 'accent' | 'neg';
}) {
  return (
    <g>
      <Mask x={x - 8} y={y - 9} width={16} height={12} rx={2} />
      <SvgText x={x} y={y} variant="sub" tone={tone}>
        {children}
      </SvgText>
    </g>
  );
}
