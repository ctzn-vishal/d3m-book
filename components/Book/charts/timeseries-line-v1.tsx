"use client";

import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ErrorBar,
    ReferenceArea,
    Text
} from 'recharts';
import { Label } from "@/viz/ui/label";
import { Switch } from "@/viz/ui/switch";
import { CATEGORICAL, CHART } from "@/lib/chart-theme";

// --- Type Definitions ---
interface DataPoint {
    year: string | number | null;
    value: number | null;
    ci_lower?: number;
    ci_upper?: number;
    n_actual?: number;
    standard_error?: number;
    [key: string]: any;
}

interface TooltipPayloadItem {
    name: string;
    value: number | null;
    color: string;
    payload: DataPoint;
    dataKey: string;
    stroke?: string;
    fill?: string;
}

interface DataPointMetadataItem {
    id: string;
    categories?: string[];
    value_prefix?: string | object;
    value_suffix?: string | object;
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
    dataPointMetadata: DataPointMetadataItem[];
}

interface TimeTrendDemoChartProps {
    data: ChartData;
    demographicGroups: string[];
    demographic: string;
    defaultVisibleGroups?: string[];
    /**
     * When true, renders a stripped-down version of the chart suitable for
     * small-multiples grids:
     *   - no card chrome (bg-surface, shadow, rounded corners) — the wrapper
     *     provides the frame
     *   - no internal title / subtitle / question block
     *   - no source line and no CI toggle footer
     *   - no Recharts legend (the wrapper renders one shared legend)
     *   - no presidential reference areas or president-name labels
     *     (illegible at panel size, mistaken for gridlines)
     *   - sparser x-axis ticks (every 20 years, not every 5)
     *   - smaller axis-tick font, smaller chart height
     *
     * The caller is expected to provide a single shared title/source/legend
     * outside the grid. Default: false.
     */
    compact?: boolean;
    /**
     * Vertical density. Three modes:
     *   - 'comfortable' (default): ~450–500px tall. For hero charts —
     *     <Figure width="page-outset"> or single big standalone charts.
     *   - 'medium': ~320–360px tall. For inline article charts inside
     *     <Figure width="body" | "body-outset">. Reduces vertical eat
     *     so prose flows past the chart instead of being broken by it.
     *   - 'compact': ~200–220px tall. Drives SmallMultiples panels;
     *     also strips chrome (see `compact` prop). Setting `compact={true}`
     *     implies `density="compact"` regardless of this prop.
     */
    density?: 'comfortable' | 'medium' | 'compact';
    /**
     * When set, overrides the chart's auto-computed y-axis domain. Used by
     * <SmallMultiples> to enforce a shared range across panels so visual
     * comparison works. Format: [min, max] in the same units as the data
     * (typically 0–100 for percentages). Default: undefined → auto-scale.
     */
    sharedYDomain?: [number, number];
}

// --- Constants ---
// Positional fallback palette — used for series whose group name has no
// established editorial color convention. Sourced from the book's shared
// chart theme (lib/chart-theme.ts) rather than an unrelated Material Design
// palette, so a chart's fallback colors match the sky/orange/emerald accents
// used everywhere else in the book.
const COLORS = CATEGORICAL;

// Identity-coded color map. When a demographic group's name matches a key
// here, use this color instead of the positional fallback. This keeps party
// charts always-blue-Democrat / always-red-Republican etc., regardless of
// the order they appear in `demographicGroups`. Add to this map carefully:
// every entry is an editorial commitment to a color convention.
const GROUP_COLORS: Record<string, string> = {
    // Political party (American convention)
    Democrat: '#2563EB',     // blue-600
    Democrats: '#2563EB',
    Republican: '#DC2626',   // red-600
    Republicans: '#DC2626',
    Independent: '#6B7280',  // gray-500
    Other: '#9CA3AF',        // gray-400 (also "Other" parties, "Other" race)
    // Political ideology (mirrors party convention: liberal=blue, conservative=red)
    Liberal: '#2563EB',      // blue-600
    Liberals: '#2563EB',
    Conservative: '#DC2626', // red-600
    Conservatives: '#DC2626',
    Moderate: '#6B7280',     // gray-500
    Moderates: '#6B7280',
};

function colorForGroup(group: string, indexInGroups: number): string {
    if (GROUP_COLORS[group]) return GROUP_COLORS[group];
    // Composite labels like "18-34 · Liberal" — match the segment after the
    // separator so multi-axis charts still inherit the editorial color.
    const parts = group.split(/\s*[·•]\s*/);
    for (let i = parts.length - 1; i >= 0; i--) {
        if (GROUP_COLORS[parts[i]]) return GROUP_COLORS[parts[i]];
    }
    return COLORS[indexInGroups % COLORS.length];
}
const presidentialTerms = [
    { start: 1971, end: 1976, party: "Republican", president: "Nixon/Ford" },
    { start: 1976, end: 1980, party: "Democrat", president: "Carter" },
    { start: 1980, end: 1992, party: "Republican", president: "Reagan/Bush" },
    { start: 1992, end: 2000, party: "Democrat", president: "Clinton" },
    { start: 2000, end: 2008, party: "Republican", president: "Bush" },
    { start: 2008, end: 2016, party: "Democrat", president: "Obama" },
    { start: 2016, end: 2020, party: "Republican", president: "Trump" },
    { start: 2020, end: 2024, party: "Democrat", president: "Biden" },
];

// --- Helper Functions ---
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
export default function TimeTrendDemoChart({
    data, demographicGroups, demographic, defaultVisibleGroups,
    compact = false, density = 'comfortable', sharedYDomain
}: TimeTrendDemoChartProps) {
    // `compact={true}` is shorthand for the smallest mode (used by SmallMultiples).
    const effectiveDensity = compact ? 'compact' : density;

    // Lazy init so we don't allocate a fresh Set on every render. The init
    // arg is read once on mount; afterwards state flows from setVisibleGroups.
    const [visibleGroups, setVisibleGroups] = useState<Set<string>>(
        () => new Set(defaultVisibleGroups || demographicGroups)
    );
    const [showCI, setShowCI] = useState(false);

    // Stabilise the dep keys. Inline JSX arrays change identity every render,
    // which used to fire this effect every render → setState → re-render
    // loop. Hashing the contents into a string makes the effect react only
    // when the actual values change, not the array reference.
    const groupsKey = demographicGroups.join('|');
    const visibleKey = (defaultVisibleGroups || demographicGroups).join('|');
    useEffect(() => {
        setVisibleGroups(new Set(defaultVisibleGroups || demographicGroups));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupsKey, visibleKey]);

    if (!data || !data.dataPoints || !Array.isArray(data.dataPoints) || data.dataPoints.length === 0) {
        return <div className="p-4 text-center text-muted">No data available to display chart.</div>;
    }

    const processedDataPoints = data.dataPoints.map(processDataPoint);
    const allValidYearsNumeric = processedDataPoints.map(d => d.year).filter((year): year is number => year !== null);

    if (allValidYearsNumeric.length === 0) {
        return <div className="p-4 text-center text-muted">Data contains no valid years.</div>;
    }

    const minYearInData = Math.min(...allValidYearsNumeric);
    const maxYearInData = Math.max(...allValidYearsNumeric);

    const relevantPresidentialTerms = presidentialTerms.filter(term =>
        term.end >= minYearInData && term.start <= maxYearInData
    );
    const firstRelevantBandStart = relevantPresidentialTerms.length > 0
        ? Math.min(...relevantPresidentialTerms.map(t => t.start)) : minYearInData;
    const xAxisMin = Math.min(firstRelevantBandStart, minYearInData);
    const xAxisMax = maxYearInData;
    // Sparser ticks in compact mode — every 5 years collides into a smudge
    // in narrow small-multiples columns. Every 20 years gives ~3 labels per
    // panel for a 50-year range, which is readable.
    const xTickInterval = compact ? 20 : 5;
    const xAxisTicks = generateTicks(xAxisMin, xAxisMax, xTickInterval);

    const groupedData = demographicGroups.map(group => {
        const groupData = processedDataPoints
            .filter(d => d[demographic] === group && d.year !== null)
            .map(d => d as DataPoint & { year: number })
            .sort((a, b) => a.year - b.year);
        return { name: group, data: groupData };
    });
    const hasCIData = groupedData.some(g =>
        g.data.some(d => d.standard_error !== undefined || (d.ci_lower !== undefined && d.ci_upper !== undefined))
    );

    const getVisibleBounds = (): { min: number; max: number } => {
        let overallMin = Infinity;
        let overallMax = -Infinity;
        let hasVisibleData = false;

        groupedData
            .filter(group => visibleGroups.has(group.name))
            .forEach(group => {
                group.data.forEach(point => {
                    if (point.value === null) return;
                    hasVisibleData = true;
                    let currentMin = point.value;
                    let currentMax = point.value;

                    if (showCI) {
                        if (point.ci_lower !== undefined && point.ci_lower !== null) { currentMin = point.ci_lower; }
                        else if (typeof point.standard_error === 'number' && !isNaN(point.standard_error)) { currentMin = point.value - 1.96 * point.standard_error; }
                        if (point.ci_upper !== undefined && point.ci_upper !== null) { currentMax = point.ci_upper; }
                        else if (typeof point.standard_error === 'number' && !isNaN(point.standard_error)) { currentMax = point.value + 1.96 * point.standard_error; }
                    }

                    if (typeof currentMin === 'number' && !isNaN(currentMin)) { overallMin = Math.min(overallMin, currentMin); }
                    if (typeof currentMax === 'number' && !isNaN(currentMax)) { overallMax = Math.max(overallMax, currentMax); }
                });
            });

        return hasVisibleData && isFinite(overallMin) && isFinite(overallMax)
            ? { min: overallMin, max: overallMax } : { min: 0, max: 100 };
    };

    const { min: effectiveMin, max: effectiveMax } = getVisibleBounds();
    let yDomain: [number, number] = [0, 100];

    // sharedYDomain wins over auto-scaling — used by <SmallMultiples> to
    // enforce a shared range across panels.
    if (sharedYDomain) {
        yDomain = sharedYDomain;
    } else if (isFinite(effectiveMin) && isFinite(effectiveMax)) {
        const dataRange = effectiveMax - effectiveMin;
        const buffer = Math.max(5, dataRange * 0.15);
        const lowerBound = effectiveMin - buffer;
        const upperBound = effectiveMax + buffer;
        const finalMin = Math.max(0, lowerBound);
        const finalMax = Math.min(100, upperBound);
        const minRange = 10;

        if (finalMin >= finalMax) {
             const centerValue = Math.min(100, Math.max(0, (effectiveMin + effectiveMax) / 2));
             yDomain = [Math.max(0, Math.floor((centerValue - minRange / 2) / 5) * 5), Math.min(100, Math.ceil((centerValue + minRange / 2) / 5) * 5)];
             if (yDomain[0] >= yDomain[1]) { yDomain = [Math.max(0, finalMin - 5), Math.min(100, finalMax + 5)]; }
        } else if (finalMax - finalMin < minRange) {
             const midPoint = (finalMin + finalMax) / 2;
             yDomain = [Math.max(0, Math.floor((midPoint - minRange / 2) / 5) * 5), Math.min(100, Math.ceil((midPoint + minRange / 2) / 5) * 5)];
             if (yDomain[0] >= yDomain[1]) {
                 yDomain = [Math.max(0, finalMin - buffer), Math.min(100, finalMax + buffer)];
                 if(yDomain[0] >= yDomain[1]) yDomain = [Math.max(0, finalMin - 5), Math.min(100, finalMax + 5)];
             }
        } else {
            yDomain = [finalMin, finalMax];
        }
    }

    const handleLegendClick = (entry: { value: string }) => {
        setVisibleGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(entry.value)) {
                newSet.delete(entry.value);
            } else {
                newSet.add(entry.value);
            }
            return newSet;
        });
    };

    const yAxisTickFormatter = (value: number | string): string => {
        const metadata = data.dataPointMetadata.find(d => d.id === 'value');
        const prefixValue = metadata?.value_prefix;
        const suffixValue = metadata?.value_suffix;
        const prefix = (prefixValue && (typeof prefixValue !== 'object' || Object.keys(prefixValue).length > 0)) ? String(prefixValue) : '';
        const suffix = (suffixValue && (typeof suffixValue !== 'object' || Object.keys(suffixValue).length > 0)) ? String(suffixValue) : '%';
        const num = Number(value);
        if (isNaN(num)) return String(value);
        const formattedValue = num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        return `${prefix}${formattedValue}${suffix}`;
    };

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string | number }) => {
        if (!active || !payload || payload.length === 0 || label === undefined) return null;
        const visiblePayload = payload.filter(series => visibleGroups.has(series.name));
        if (visiblePayload.length === 0) return null;
        const valueMetadata = data.dataPointMetadata.find(m => m.id === 'value');
        const suffix = (typeof valueMetadata?.value_suffix === 'string') ? valueMetadata.value_suffix : '%';
        const prefix = (typeof valueMetadata?.value_prefix === 'string') ? valueMetadata.value_prefix : '';

        return (
            <div className="max-w-xs rounded-md border border-border bg-surface p-3 text-sm">
                <p className="mb-2 font-semibold text-subtle">{`Year: ${label}`}</p>
                {visiblePayload.map((series) => {
                    const colorIndex = demographicGroups.indexOf(series.name);
                    const color = colorIndex !== -1 ? colorForGroup(series.name, colorIndex) : series.color || '#8884d8';
                    const pointData = series.payload;
                    return (
                        <div key={series.name} className="mb-1.5 last:mb-0">
                            <p className="font-medium" style={{ color: color }}>{series.name}</p>
                            <p className="text-subtle" style={{ color: color }}>
                                {`Value: ${series.value != null ? `${prefix}${series.value.toFixed(1)}${suffix}` : 'N/A'}`}
                            </p>
                            {pointData?.ci_lower !== undefined && pointData?.ci_upper !== undefined && (
                                <p className="text-xs text-muted">
                                    {`95% CI: [${pointData.ci_lower.toFixed(1)}%, ${pointData.ci_upper.toFixed(1)}%]`}
                                </p>
                            )}
                            {pointData?.n_actual && (
                                <p className="text-xs text-muted">
                                    {`N: ${pointData.n_actual.toLocaleString()}`}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={
            compact
                ? "w-full p-2"
                : `w-full overflow-hidden rounded-md border border-border bg-surface px-3.5 pb-4 pt-3  md:px-5 md:pt-4`
        }>
            {!compact && (
                <div className="mb-3 border-b border-border pb-2">
                    <h2 className="text-sm font-semibold leading-snug text-body">{data.metadata.title}</h2>
                    {data.metadata.subtitle && <p className="mt-0.5 text-xs leading-snug text-subtle">{data.metadata.subtitle}</p>}
                    {data.metadata.question && <p className="mt-0.5 text-xs italic leading-snug text-muted">{data.metadata.question}</p>}
                </div>
            )}

            <div
                className={
                    effectiveDensity === 'compact'
                        ? 'h-[180px] md:h-[200px] w-full'
                        : effectiveDensity === 'medium'
                        ? 'h-[280px] md:h-[320px] w-full'
                        : 'h-[360px] md:h-[400px] w-full'
                }
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        key={`${demographic}-${showCI}`}
                        margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                        {!compact && relevantPresidentialTerms.map((term, index) => (
                            <ReferenceArea key={`term-bg-${index}`} x1={term.start} x2={term.end} yAxisId="left"
                                fill={term.party === "Democrat" ? "rgba(230, 240, 255, 0.5)" : "rgba(255, 235, 238, 0.5)"}
                                ifOverflow="visible" shapeRendering="crispEdges" />
                        ))}

                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />

                        <XAxis
                            dataKey="year" type="number"
                            domain={[xAxisMin, xAxisMax]}
                            allowDataOverflow={true}
                            ticks={xAxisTicks}
                            tick={{ fontSize: compact ? 10 : 11, fill: '#666' }}
                            padding={{ left: 10, right: 10 }}
                            tickFormatter={(year) => String(year)}
                            interval={0}
                            axisLine={{ stroke: '#ccc' }}
                            tickLine={{ stroke: '#ccc' }}
                        />

                        <YAxis
                            yAxisId="left"
                            tickFormatter={yAxisTickFormatter}
                            domain={yDomain}
                            allowDataOverflow={false}
                            axisLine={false} tickLine={false}
                            tick={{ fontSize: compact ? 10 : 11, fill: '#666' }}
                            width={compact ? 36 : 50}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a0a0a0', strokeWidth: 1, strokeDasharray: '3 3' }} />

                        {!compact && (
                            <Legend verticalAlign="bottom" align="center" height={40} onClick={handleLegendClick}
                                iconSize={10} wrapperStyle={{ paddingTop: '10px' }}
                                formatter={(value) => {
                                    const isVisible = visibleGroups.has(value);
                                    return (<span style={{ color: isVisible ? CHART.ink : CHART.faint, cursor: 'pointer', marginLeft: '4px', fontSize: '12px' }}>{value}</span>);
                                }} />
                        )}

                        {groupedData.map((group) => {
                            const colorIndex = demographicGroups.indexOf(group.name);
                            const color = colorIndex !== -1 ? colorForGroup(group.name, colorIndex) : '#8884d8';
                            return (
                                <Line
                                    key={group.name} yAxisId="left" type="linear"
                                    data={group.data}
                                    dataKey="value" name={group.name} stroke={color} strokeWidth={2}
                                    dot={{ r: 3, fill: color, strokeWidth: 1, stroke: 'white' }}
                                    activeDot={{ r: 5, strokeWidth: 1, stroke: 'white' }}
                                    hide={!visibleGroups.has(group.name)}
                                    connectNulls={true}
                                    isAnimationActive={false}
                                >
                                    {showCI && hasCIData && (
                                        <ErrorBar
                                            dataKey={(d: DataPoint) => (typeof d.standard_error === 'number' && !isNaN(d.standard_error)) ? (1.96 * d.standard_error) : 0}
                                            width={4} strokeWidth={1.5} stroke={color}
                                            opacity={0.35} direction="y"
                                        />
                                    )}
                                </Line>
                            );
                        })}

                        {!compact && relevantPresidentialTerms.map((term, index) => (
                            <Text
                                key={`term-label-${index}`}
                                x={(term.start + term.end) / 2}
                                y={typeof yDomain[1] === 'number' ? yDomain[1] - 3 : 97}
                                textAnchor="middle"
                                verticalAnchor="start"
                                fill="#6b7280"
                                fontSize={10}
                            >
                                {term.president}
                            </Text>
                        ))}

                    </LineChart>
                </ResponsiveContainer>
            </div>

            {!compact && (
                <div className="mt-3 flex flex-col items-start justify-between gap-2 border-t border-border pt-2 sm:flex-row sm:items-center">
                    <div className="order-1 text-left text-[11px] leading-snug text-muted sm:order-none">
                        Source: {data.metadata.source?.name || 'Not specified'}
                        {data.metadata.observations && ` (${data.metadata.observations.toLocaleString()} Observations)`}
                    </div>

                    <div className="order-2 flex items-center space-x-2 sm:order-none">
                        <Switch
                            id="show-ci" checked={showCI} onCheckedChange={setShowCI}
                            disabled={!hasCIData}
                        />
                        <Label htmlFor="show-ci" className={`text-xs ${!hasCIData ? 'text-muted' : 'text-subtle'}`}>
                            Show 95% CI
                        </Label>
                    </div>
                </div>
            )}
        </div>
    );
}
