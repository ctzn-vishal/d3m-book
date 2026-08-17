/**
 * Orthogonal connector geometry.
 *
 * The rule this file exists to enforce: **no diagonals between off-axis
 * nodes.** A straight `<line>` is legal only when the two endpoints share an x
 * or a y; everything else is a rounded right-angle elbow. Diagonal connectors
 * were the single most common defect in the book's flow diagrams — `RagPipeline`
 * had four, and the "top-k retrieve" label sat directly on one of them.
 *
 * (The exception, which lives outside this kit: causal DAGs and axis-based
 * econ figures. A DAG is *conventionally* drawn with diagonal arrows, and
 * straightening one would misrepresent the notation. Those diagrams keep their
 * diagonals and don't use `connectorPath`.)
 */

export type Pt = readonly [number, number];

/**
 * Which way the elbow turns.
 *
 * - `straight` — endpoints share an axis. The only legal use of a plain line.
 * - `hvh` — out sideways, across at a mid x, back in sideways. The two-bend
 *   workhorse for left→right layouts. Arrow labels go on the vertical run.
 * - `vhv` — the same, rotated: out vertically, across at a mid y, back in.
 * - `hv` — one bend: sideways, then down/up *into the node's top or bottom*.
 * - `vh` — one bend: down/up, then sideways into the node's left or right edge.
 *
 * Port selection matters more than it looks. When the destination is
 * noticeably above or below the source, enter through its top or bottom edge
 * (`hv`), not its side — a mainly-vertical arrow that lands on a side port
 * reads as puncturing the node's face rather than arriving from above.
 */
export type Route = 'straight' | 'hvh' | 'vhv' | 'hv' | 'vh';

export interface ConnectorPathOptions {
  route?: Route;
  /** Corner radius. 8 by default; drop to 6 only for genuinely tight layouts. */
  r?: number;
  /**
   * Where the middle run sits — an x for `hvh`, a y for `vhv`. Defaults to the
   * midpoint. Override it to keep two parallel connectors ≥12px apart, or to
   * pull a bend clear of an intervening node.
   */
  mid?: number;
  /**
   * Crossing points to bridge over, as `[x, y]`. Each becomes a small
   * semicircular hop so the two connectors stay independently traceable.
   * Bridge the *less* important arrow — the passive, secondary, or dashed one
   * — and never both.
   */
  hops?: readonly Pt[];
}

const EPS = 0.75;
/** Radius of a bridge hop, and half its advance along the line. */
const HOP_R = 8;

/** Corner points for a route, source and destination included. */
function corners(from: Pt, to: Pt, route: Route, mid?: number): Pt[] {
  const [x1, y1] = from;
  const [x2, y2] = to;
  switch (route) {
    case 'straight':
      return [from, to];
    case 'hvh': {
      const mx = mid ?? (x1 + x2) / 2;
      return [from, [mx, y1], [mx, y2], to];
    }
    case 'vhv': {
      const my = mid ?? (y1 + y2) / 2;
      return [from, [x1, my], [x2, my], to];
    }
    case 'hv':
      return [from, [x2, y1], to];
    case 'vh':
      return [from, [x1, y2], to];
  }
}

/** Drop corners that coincide with their neighbour — a bend of zero length. */
function dedupe(pts: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (!last || Math.abs(last[0] - p[0]) > EPS || Math.abs(last[1] - p[1]) > EPS) {
      out.push(p);
    }
  }
  return out;
}

/** Emit `L`/`a` commands from `a` to `b`, hopping any crossings in between. */
function runTo(a: Pt, b: Pt, hops: readonly Pt[], out: string[]) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const dir = horizontal ? Math.sign(dx) : Math.sign(dy);

  const on = hops
    .filter(h => {
      // A hop counts if it sits on this run and clears both ends by the
      // hop radius — a bridge that starts inside a corner arc is a smear.
      if (horizontal) {
        if (Math.abs(h[1] - a[1]) > 6) return false;
        const t = (h[0] - a[0]) * dir;
        return t > HOP_R && t < Math.abs(dx) - HOP_R;
      }
      if (Math.abs(h[0] - a[0]) > 6) return false;
      const t = (h[1] - a[1]) * dir;
      return t > HOP_R && t < Math.abs(dy) - HOP_R;
    })
    .sort((p, q) => (horizontal ? (p[0] - q[0]) * dir : (p[1] - q[1]) * dir));

  for (const h of on) {
    if (horizontal) {
      out.push(`L ${round(h[0] - HOP_R * dir)},${round(a[1])}`);
      // sweep flips with direction so the bump always arcs upward
      out.push(`a ${HOP_R},${HOP_R} 0 0,${dir > 0 ? 1 : 0} ${2 * HOP_R * dir},0`);
    } else {
      out.push(`L ${round(a[0])},${round(h[1] - HOP_R * dir)}`);
      out.push(`a ${HOP_R},${HOP_R} 0 0,${dir > 0 ? 0 : 1} 0,${2 * HOP_R * dir}`);
    }
  }
  out.push(`L ${round(b[0])},${round(b[1])}`);
}

const round = (n: number) => Math.round(n * 100) / 100;

const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Point `r` along the way from `a` toward `b`. */
function toward(a: Pt, b: Pt, r: number): Pt {
  const d = dist(a, b);
  if (d === 0) return a;
  return [a[0] + ((b[0] - a[0]) / d) * r, a[1] + ((b[1] - a[1]) / d) * r];
}

/**
 * Build an SVG path between two points, bending only at right angles.
 *
 * Corners are quarter-arcs drawn as quadratics through the corner point, which
 * is what makes them read as *drawn* rather than as a routing artefact. The
 * radius shrinks automatically when a segment is too short to carry it, so a
 * cramped elbow degrades to a sharper corner instead of overshooting.
 */
export function connectorPath(
  from: Pt,
  to: Pt,
  { route = 'hvh', r = 8, mid, hops = [] }: ConnectorPathOptions = {}
): string {
  const pts = dedupe(corners(from, to, route, mid));
  if (pts.length < 2) return '';

  const out: string[] = [`M ${round(pts[0][0])},${round(pts[0][1])}`];
  let cursor: Pt = pts[0];

  for (let i = 1; i < pts.length - 1; i++) {
    const corner = pts[i];
    const next = pts[i + 1];
    const rr = Math.min(r, dist(cursor, corner) / 2, dist(corner, next) / 2);
    const entry = toward(corner, cursor, rr);
    const exit = toward(corner, next, rr);
    runTo(cursor, entry, hops, out);
    out.push(`Q ${round(corner[0])},${round(corner[1])} ${round(exit[0])},${round(exit[1])}`);
    cursor = exit;
  }

  runTo(cursor, pts[pts.length - 1], hops, out);
  return out.join(' ');
}

/**
 * Evenly spaced attach points along an edge, for the case where several
 * connectors share one side of a box.
 *
 * Two arrows leaving the same point on a box is a hard fail — you can't tell
 * which is which. Point `k` of `n` sits at `L·k/(n+1)` from the leading corner,
 * which keeps them symmetric about the centre and never lands one on a rounded
 * corner. Aim for ≥12px between adjacent points; if `fan` returns anything
 * tighter, the box is too small for that many connections and the layout needs
 * rethinking rather than squeezing.
 */
export function fan(start: number, end: number, n: number): number[] {
  const span = end - start;
  return Array.from({ length: n }, (_, i) => start + (span * (i + 1)) / (n + 1));
}

/** The midpoint of the middle run — where an `hvh`/`vhv` label belongs. */
export function midRun(from: Pt, to: Pt, route: Route, mid?: number): Pt {
  const [x1, y1] = from;
  const [x2, y2] = to;
  if (route === 'hvh') {
    const mx = mid ?? (x1 + x2) / 2;
    return [mx, (y1 + y2) / 2];
  }
  if (route === 'vhv') {
    const my = mid ?? (y1 + y2) / 2;
    return [(x1 + x2) / 2, my];
  }
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}
