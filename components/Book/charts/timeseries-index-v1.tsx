"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { CATEGORICAL, CHART } from "@/lib/chart-theme";

// --- Type Definitions ---
//
// Same GSS-shape envelope as timeseries-line-v1.tsx so the two charts
// are interchangeable from the article's POV. The only new prop is
// `baselineYear` — every demographic series is rebased to 100 at that
// year, so the chart shows *relative change* across a family rather
// than absolute levels.
interface DataPoint {
    year: string | number | null;
    value: number | null;
    n_actual?: number;
    [key: string]: any;
}

interface ChartData {
    metadata: {
        title: string;
        subtitle?: string;
        question?: string;
        source?: { name: string; id?: string; };
        observations?: number;
        [key: string]: any;
    };
    dataPoints: DataPoint[];
    dataPointMetadata: Array<{ id: string; [key: string]: any; }>;
}

interface TimeseriesIndexProps {
    data: ChartData;
    demographicGroups: string[];
    demographic: string;
    defaultVisibleGroups?: string[];
    /**
     * The year each demographic series is rebased to 100. The chart
     * picks the value of each series at this year (or the closest
     * available year ≥ this year if the exact year is missing) and
     * divides every other point by it × 100. Series that have no
     * observation at or after the baseline are dropped.
     */
    baselineYear: number;
    /**
     * Override the default subtitle "Indexed to <baselineYear> = 100".
     */
    baselineLabel?: string;
    /**
     * Compact rendering for SmallMultiples — same semantics as the
     * line chart variant (no chrome, no internal title, sparse ticks,
     * smaller height). Default: false.
     */
    compact?: boolean;
    /**
     * Override the auto-computed y-axis domain. Used by SmallMultiples
     * to enforce a shared range across panels. Format: [min, max] in
     * index units (typically something like [40, 160]). Default:
     * undefined → auto-scale.
     */
    sharedYDomain?: [number, number];
}

// Same palette as timeseries-line-v1 (sourced from lib/chart-theme.ts) so a
// chapter that mixes the two keeps consistent demographic colors.
const COLORS = CATEGORICAL;

// --- Helpers ---
const generateTicks = (start: number, end: number, interval: number): number[] => {
    const ticks: number[] = [];
    const firstTick = Math.ceil(start / interval) * interval;
    for (let i = firstTick; i <= end; i += interval) {
        if (i <= end) { ticks.push(i); }
    }
    return ticks;
};

const processDataPoint = (d: DataPoint): DataPoint & { year: number | null } => {
    const yearNum = parseInt(String(d.year), 10);
    const valueNum = typeof d.value === 'number' ? d.value : parseFloat(String(d.value));
    return {
        ...d,
        year: isNaN(yearNum) ? null : yearNum,
        value: typeof valueNum === 'number' && !isNaN(valueNum) ? valueNum : null
    };
};

// --- Component ---
export default function TimeseriesIndexV1({
    data, demographicGroups, demographic, defaultVisibleGroups,
    baselineYear, baselineLabel, compact = false, sharedYDomain
}: TimeseriesIndexProps) {
    const [visibleGroups, setVisibleGroups] = useState<Set<string>>(
        new Set(defaultVisibleGroups || demographicGroups)
    );

    useEffect(() => {
        setVisibleGroups(new Set(defaultVisibleGroups || demographicGroups));
    }, [demographicGroups, defaultVisibleGroups]);

    if (!data || !data.dataPoints || !Array.isArray(data.dataPoints) || data.dataPoints.length === 0) {
        return <div className="p-4 text-center text-gray-500">No data available to display chart.</div>;
    }

    const processed = data.dataPoints.map(processDataPoint);
    const validYears = processed.map(d => d.year).filter((y): y is number => y !== null);
    if (validYears.length === 0) {
        return <div className="p-4 text-center text-gray-500">Data contains no valid years.</div>;
    }

    const minYear = Math.min(...validYears);
    const maxYear = Math.max(...validYears);

    // Group + index per demographic. For each group, find the value at
    // baselineYear (or the smallest year ≥ baselineYear that has data),
    // then rebase every point to (value / baseline) × 100.
    const indexed = useMemo(() => {
        return demographicGroups.map((group, idx) => {
            const points = processed
                .filter(d => d[demographic] === group && d.year !== null && d.value !== null)
                .map(d => d as DataPoint & { year: number; value: number })
                .sort((a, b) => a.year - b.year);

            if (points.length === 0) return { name: group, data: [], colorIndex: idx };

            // Pick the baseline observation: exact year if present,
            // otherwise the smallest year ≥ baselineYear that has data.
            const baseline = points.find(p => p.year === baselineYear)
                ?? points.find(p => p.year >= baselineYear);
            if (!baseline || baseline.value === 0) {
                return { name: group, data: [], colorIndex: idx };
            }

            const rebased = points.map(p => ({
                year: p.year,
                value: (p.value / baseline.value) * 100,
                raw: p.value,
                n_actual: p.n_actual,
            }));
            return { name: group, data: rebased, colorIndex: idx };
        });
    }, [processed, demographicGroups, demographic, baselineYear]);

    // Compute auto y-domain from visible series.
    const yDomain = useMemo<[number, number]>(() => {
        if (sharedYDomain) return sharedYDomain;
        let min = Infinity;
        let max = -Infinity;
        let hasData = false;
        for (const g of indexed) {
            if (!visibleGroups.has(g.name)) continue;
            for (const p of g.data) {
                hasData = true;
                if (p.value < min) min = p.value;
                if (p.value > max) max = p.value;
            }
        }
        if (!hasData || !isFinite(min) || !isFinite(max)) return [50, 150];
        const range = max - min;
        const buffer = Math.max(10, range * 0.15);
        return [Math.floor((min - buffer) / 10) * 10, Math.ceil((max + buffer) / 10) * 10];
    }, [indexed, visibleGroups, sharedYDomain]);

    const xTickInterval = compact ? 20 : 5;
    const xTicks = generateTicks(minYear, maxYear, xTickInterval);

    const handleLegendClick = (entry: { value: string }) => {
        setVisibleGroups(prev => {
            const next = new Set(prev);
            if (next.has(entry.value)) next.delete(entry.value);
            else next.add(entry.value);
            return next;
        });
    };

    const yAxisTickFormatter = (v: number | string) => {
        const n = Number(v);
        if (isNaN(n)) return String(v);
        return n.toFixed(0);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || payload.length === 0 || label === undefined) return null;
        const visible = payload.filter((s: any) => visibleGroups.has(s.name));
        if (visible.length === 0) return null;
        return (
            <div className="max-w-xs rounded-md border border-slate-200 bg-white p-3 text-sm shadow-lg">
                <p className="mb-2 font-semibold text-slate-700">{`Year: ${label}`}</p>
                {visible.map((s: any) => {
                    const colorIndex = demographicGroups.indexOf(s.name);
                    const color = colorIndex !== -1 ? COLORS[colorIndex % COLORS.length] : '#8884d8';
                    const raw = s.payload?.raw;
                    return (
                        <div key={s.name} className="mb-1.5 last:mb-0">
                            <p className="font-medium" style={{ color }}>{s.name}</p>
                            <p className="text-slate-600" style={{ color }}>
                                {`Index: ${s.value != null ? s.value.toFixed(1) : 'N/A'}`}
                            </p>
                            {raw != null && (
                                <p className="text-xs text-slate-500">
                                    {`Raw: ${raw.toFixed(1)}%`}
                                </p>
                            )}
                            {s.payload?.n_actual && (
                                <p className="text-xs text-slate-500">
                                    {`N: ${s.payload.n_actual.toLocaleString()}`}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const subtitle = baselineLabel ?? `Indexed to ${baselineYear} = 100`;

    return (
        <div className={
            compact
                ? "w-full p-2"
                : "w-full overflow-hidden rounded-md border border-slate-200 bg-white px-3.5 pb-4 pt-3 shadow-sm md:px-5 md:pt-4"
        }>
            {!compact && (
                <div className="mb-3 border-b border-slate-100 pb-2">
                    <h2 className="text-sm font-semibold leading-snug text-slate-900">{data.metadata.title}</h2>
                    <p className="mt-0.5 text-xs leading-snug text-slate-600">{subtitle}</p>
                    {data.metadata.question && <p className="mt-0.5 text-xs italic leading-snug text-slate-500">{data.metadata.question}</p>}
                </div>
            )}

            <div className={compact ? "h-[180px] md:h-[200px] w-full" : "h-[360px] md:h-[400px] w-full"}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />

                        <XAxis
                            dataKey="year" type="number"
                            domain={[minYear, maxYear]}
                            allowDataOverflow={true}
                            ticks={xTicks}
                            tick={{ fontSize: compact ? 10 : 11, fill: '#666' }}
                            padding={{ left: 10, right: 10 }}
                            tickFormatter={(year) => String(year)}
                            interval={0}
                            axisLine={{ stroke: '#ccc' }}
                            tickLine={{ stroke: '#ccc' }}
                        />

                        <YAxis
                            tickFormatter={yAxisTickFormatter}
                            domain={yDomain}
                            allowDataOverflow={false}
                            axisLine={false} tickLine={false}
                            tick={{ fontSize: compact ? 10 : 11, fill: '#666' }}
                            width={compact ? 36 : 50}
                        />

                        {/* Reference line at index = 100 (the baseline). Sits
                            behind the data lines so it reads as a guide,
                            not a series. */}
                        <ReferenceLine y={100} stroke="#999" strokeDasharray="4 2" />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a0a0a0', strokeWidth: 1, strokeDasharray: '3 3' }} />

                        {!compact && (
                            <Legend verticalAlign="bottom" align="center" height={40} onClick={handleLegendClick}
                                iconSize={10} wrapperStyle={{ paddingTop: '10px' }}
                                formatter={(value) => {
                                    const isVisible = visibleGroups.has(value);
                                    return (<span style={{ color: isVisible ? CHART.ink : CHART.faint, cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>{value}</span>);
                                }} />
                        )}

                        {indexed.map((group) => {
                            const color = COLORS[group.colorIndex % COLORS.length];
                            return (
                                <Line
                                    key={group.name} type="linear"
                                    data={group.data}
                                    dataKey="value" name={group.name} stroke={color} strokeWidth={2}
                                    dot={{ r: 3, fill: color, strokeWidth: 1, stroke: 'white' }}
                                    activeDot={{ r: 5, strokeWidth: 1, stroke: 'white' }}
                                    hide={!visibleGroups.has(group.name)}
                                    connectNulls={true}
                                    isAnimationActive={false}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {!compact && (
                <div className="mt-3 flex flex-col items-start justify-between gap-2 border-t border-slate-100 pt-2 sm:flex-row sm:items-center">
                    <div className="order-1 text-left text-[11px] leading-snug text-slate-500 sm:order-none">
                        Source: {data.metadata.source?.name || 'Not specified'}
                        {data.metadata.observations && ` (${data.metadata.observations.toLocaleString()} Observations)`}
                    </div>
                </div>
            )}
        </div>
    );
}
