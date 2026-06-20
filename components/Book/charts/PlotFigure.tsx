'use client';

import { useEffect, useRef, useState } from 'react';
import * as Plot from '@observablehq/plot';

type PlotOptions = Parameters<typeof Plot.plot>[0];

/**
 * Responsive React wrapper for Observable Plot. Pass `options` as a function of
 * the measured container width so charts reflow; the spec renders client-side
 * in an effect and is cleaned up on unmount (Plot has no SSR output, like the
 * book's existing Recharts charts).
 *
 * Consumers must be client components (the `options` function prop cannot cross
 * the server→client boundary) — every Part II chart component already is.
 */
export function PlotFigure({
  options,
  className,
  ariaLabel,
}: {
  options: (width: number) => PlotOptions;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start from a sensible default so the chart paints on first render; refine
  // when a real measurement arrives (the ResizeObserver only overrides with a
  // positive width, so environments that report 0 keep the default).
  const [width, setWidth] = useState(700);

  // Measure the container; re-render the plot when it changes.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || width === 0) return;
    const plot = Plot.plot(options(width));
    el.replaceChildren(plot);
    return () => {
      el.replaceChildren();
    };
  }, [options, width]);

  return <div ref={ref} className={className} role="img" aria-label={ariaLabel} />;
}
