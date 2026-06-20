'use client';

import { useEffect, useRef, useState } from 'react';
import * as Plot from '@observablehq/plot';
import * as topojson from 'topojson-client';
import { CHART, withBookTheme } from '@/lib/chart-theme';

type PlotOptions = NonNullable<Parameters<typeof Plot.plot>[0]>;

export type GeoRow = {
  /** FIPS id: 2-digit for states, 5-digit for counties (string, zero-padded). */
  id: string;
  value: number | null;
  /** Optional display name; falls back to the topojson feature name. */
  label?: string;
};

/**
 * Book-themed US choropleth (state or county) built on Observable Plot's
 * `albers-usa` projection over vendored us-atlas topojson (in /public/topojson).
 * Quantile color scale, white borders, hover tooltips, responsive width.
 */
export function ChoroplethMap({
  data,
  level = 'states',
  scheme = 'blues',
  valueLabel = 'Value',
  valueFormat = (v: number) => String(v),
  ariaLabel,
}: {
  data: GeoRow[];
  level?: 'states' | 'counties';
  scheme?: string;
  valueLabel?: string;
  valueFormat?: (v: number) => string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [topo, setTopo] = useState<TopoJSON.Topology | null>(null);
  // Default width so the map paints before/without a real measurement.
  const [width, setWidth] = useState(700);

  useEffect(() => {
    let active = true;
    fetch(`/topojson/${level}-10m.json`)
      .then(r => r.json())
      .then(t => {
        if (active) setTopo(t);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [level]);

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
    if (!el || !topo || width === 0) return;

    const objects = (topo as unknown as { objects: Record<string, TopoJSON.GeometryCollection> }).objects;
    const key = level === 'counties' ? 'counties' : 'states';
    const features = (topojson.feature(topo, objects[key]) as unknown as GeoJSON.FeatureCollection).features;
    const stateMesh = objects.states ? topojson.mesh(topo, objects.states, (a, b) => a !== b) : null;
    const nation = objects.nation ? topojson.feature(topo, objects.nation) : null;

    const valueMap = new Map(data.map(d => [d.id, d.value]));
    const labelMap = new Map(data.map(d => [d.id, d.label]));

    const fipsOf = (d: GeoJSON.Feature) => String(d.id);
    const nameOf = (d: GeoJSON.Feature) =>
      labelMap.get(fipsOf(d)) ?? (d.properties as { name?: string } | null)?.name ?? fipsOf(d);

    const plot = Plot.plot(
      withBookTheme({
        width,
        height: Math.round(width * 0.62),
        projection: 'albers-usa',
        color: {
          type: 'quantile',
          n: 6,
          scheme,
          label: valueLabel,
          legend: true,
          unknown: '#F1F3F5',
        } as PlotOptions['color'],
        marks: [
          Plot.geo(features, {
            fill: (d: GeoJSON.Feature) => {
              const v = valueMap.get(fipsOf(d));
              return v == null ? null : v;
            },
            stroke: '#fff',
            strokeWidth: level === 'counties' ? 0.15 : 0.5,
            tip: true,
            title: (d: GeoJSON.Feature) => {
              const v = valueMap.get(fipsOf(d));
              return v == null
                ? `${nameOf(d)}\nno data`
                : `${nameOf(d)}\n${valueLabel}: ${valueFormat(v)}`;
            },
          }),
          stateMesh ? Plot.geo(stateMesh, { stroke: CHART.faint, strokeWidth: 0.5 }) : null,
          nation ? Plot.geo(nation, { stroke: CHART.muted, strokeWidth: 0.8, fill: 'none' }) : null,
        ].filter(Boolean),
        marginLeft: 0,
        marginRight: 0,
      })
    );

    el.replaceChildren(plot);
    return () => {
      el.replaceChildren();
    };
  }, [topo, width, data, level, scheme, valueLabel, valueFormat]);

  return <div ref={ref} role="img" aria-label={ariaLabel ?? valueLabel} />;
}
