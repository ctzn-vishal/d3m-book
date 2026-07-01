'use client';

import * as React from 'react';

export interface StaticChartV1Props {
  /**
   * Resolved URL or path to the SVG. Caller is responsible for
   * resolving Tigris-relative keys to a usable URL or local path
   * before passing in. The component does no fetching.
   *
   * Acceptable forms:
   *   - Full URL:                "https://cdn.example.com/foo.svg"
   *   - Public CDN URL:          "https://t3.storage.dev/..."
   *   - App-local path:          "/articles/<slug>/data/foo.svg"
   *   - Inline data URI:         "data:image/svg+xml;..."
   */
  svgUrl: string;
  /**
   * Required for accessibility. Describe what the chart shows in
   * one sentence ("Weekend revenue is more volatile in suburban
   * stores than downtown stores").
   */
  alt: string;
  /**
   * Optional source line shown below the image, matching the live-
   * chart envelope. If omitted, no source row renders.
   */
  source?: string;
  /**
   * Optional small text shown above the image as the chart title.
   * If your figure already provides a title via `<Figure caption>`,
   * leave this off — two titles look like noise.
   */
  title?: string;
  /**
   * Optional subtitle below the title (same role as the live chart's
   * subtitle). Same advice as `title` — only set if the surrounding
   * Figure isn't already providing context.
   */
  subtitle?: string;
}

/**
 * StaticChartV1 — a pre-rendered chart image inside the standard live-
 * chart visual envelope (white card, padding, optional title /
 * subtitle, source row).
 *
 * Use this when:
 *   1. A generated SVG or external chart asset is available, AND
 *   2. The article author has explicitly chosen the static version
 *      (planner output sets `static_preferred: true`).
 *
 * The default for live data is `<TimeseriesLineV1>` or
 * `<TimeseriesIndexV1>` — those carry interactive controls (legend
 * toggling, CI overlay) the static version can't. Reach for static
 * only when "the canonical pre-rendered version" is the editorial
 * point: an institutionally-published chart, a frozen reference
 * snapshot, or a paragraph where interactive controls would distract.
 *
 * No fetch. The caller resolves the URL from imported article data,
 * a manifest written during data fetch, or a public/static asset path.
 */
export function StaticChartV1({ svgUrl, alt, source, title, subtitle }: StaticChartV1Props) {
  return (
    <div className="w-full overflow-hidden rounded-md border border-slate-200 bg-white px-3.5 pb-4 pt-3 shadow-sm dark:border-slate-700 dark:shadow-none md:px-5 md:pt-4">
      {(title || subtitle) && (
        <div className="mb-3 border-b border-slate-100 pb-2">
          {title && (
            <h2 className="text-sm font-semibold leading-snug text-slate-900">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs leading-snug text-slate-600">{subtitle}</p>
          )}
        </div>
      )}

      <div className="w-full">
        <img
          src={svgUrl}
          alt={alt}
          className="block w-full h-auto"
          loading="lazy"
        />
      </div>

      {source && (
        <div className="mt-3 border-t border-slate-100 pt-2">
          <div className="text-left text-[11px] leading-snug text-slate-500">
            Source: {source}
          </div>
        </div>
      )}
    </div>
  );
}

export default StaticChartV1;
