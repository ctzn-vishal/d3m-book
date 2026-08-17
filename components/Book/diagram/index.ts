/**
 * The book's diagram kit.
 *
 * Every schematic under `components/Book/part*` renders through these. The
 * rules they encode come from the `diagram-design` skill (v2.4.0, profile
 * `d3m-book`); `docs/DIAGRAMS.md` is the working guide — when to draw, which
 * visual type, the complexity budget, the focal-accent rule.
 *
 * The short version, for anyone about to add a diagram:
 *
 * - **≤9 nodes, ≤12 arrows.** Over budget means two diagrams, not a denser one.
 * - **≤2 accent elements.** Accent means "look here first". On five nodes it
 *   means nothing.
 * - **No diagonals** between off-axis nodes — `Connector` bends at right
 *   angles. (Causal DAGs and axis-based econ figures are the exception and
 *   don't use this kit.)
 * - **No hardcoded colour.** `tokens.ts` is the only file that names one.
 * - **No shadows, no `foreignObject`, no JetBrains Mono.**
 */

export { DiagramFrame, DiagramSvg, Mask, useDiagramId, useMarker } from './DiagramFrame';
export type { DiagramFrameProps, DiagramSvgProps } from './DiagramFrame';

export { Node, MergeDot, anchor } from './Node';
export type { NodeProps, NodeVariant, NodeShape, Box } from './Node';

export { Entity, Cardinality, entityHeight, ENTITY_HEADER, ENTITY_ROW } from './Entity';
export type { EntityProps, Field } from './Entity';

export { Connector, PathConnector } from './Connector';
export type { ConnectorProps } from './Connector';

export { ArrowLabel, EyebrowLabel } from './ArrowLabel';
export type { ArrowLabelProps, LabelSide } from './ArrowLabel';

export { Legend } from './Legend';
export type { LegendItem, LegendProps, SwatchKind } from './Legend';

export { Zone, Lane } from './Zone';
export type { ZoneProps } from './Zone';

export { Layers } from './LayerStack';
export type { LayersProps, LayerSpec } from './LayerStack';

export { Venn } from './Venn';
export type { VennProps, VennCircle } from './Venn';

export { TreeBus } from './Tree';
export type { TreeBusProps } from './Tree';

export { row, centeredRow, ring, ringArc, spoke } from './layout';

export { SvgText, wrapText, textWidth, lineCount } from './text';
export type { SvgTextProps } from './text';

export { connectorPath, fan, midRun } from './path';
export type { Pt, Route, ConnectorPathOptions } from './path';

export { T, S, R, FONT, CHAR_W, GRID, snap, snapUp, toneStroke } from './tokens';
export type { Tone } from './tokens';
