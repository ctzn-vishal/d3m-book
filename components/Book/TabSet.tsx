'use client';

import * as React from 'react';

export interface TabProps {
  label: string;
  children: React.ReactNode;
}

/**
 * Tab — declarative child of <TabSet>. Renders nothing on its own; <TabSet>
 * reads its props.
 */
export function Tab(_: TabProps): null {
  return null;
}

export interface TabSetProps {
  children: React.ReactNode;
  /** Default selected tab index. Default 0. */
  defaultIndex?: number;
  /** Optional accessible label for the tablist. */
  ariaLabel?: string;
}

/**
 * TabSet — N tabs, one frame. Active tab visually distinct (font weight +
 * 2px bottom border). Keyboard navigable: arrow keys cycle, Home/End jump.
 *
 * Children must be <Tab label="..."> elements. Non-Tab children are ignored.
 *
 * Best for: comparing related charts of the same shape ("by party / by
 * education / by religion"). NOT for: comparisons where the side-by-side
 * pattern is the finding — use <SmallMultiples> instead.
 */
export function TabSet({
  children,
  defaultIndex = 0,
  ariaLabel,
}: TabSetProps) {
  // We accept any React element child that carries a `label` string
  // prop — checking component identity (`c.type === Tab`) breaks under
  // MDX, which can re-wrap children and produce a different reference
  // than the importer's `Tab` symbol. The label-prop heuristic survives
  // both regular JSX and MDX usage.
  const tabs = React.Children.toArray(children).filter(
    (c): c is React.ReactElement<TabProps> =>
      React.isValidElement(c) &&
      typeof (c.props as TabProps | undefined)?.label === 'string',
  );

  const [active, setActive] = React.useState(
    Math.min(Math.max(defaultIndex, 0), Math.max(tabs.length - 1, 0)),
  );
  const triggerRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  if (tabs.length === 0) {
    return null;
  }

  const focus = (i: number) => {
    setActive(i);
    triggerRefs.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focus((active + 1) % tabs.length);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focus((active - 1 + tabs.length) % tabs.length);
        break;
      case 'Home':
        e.preventDefault();
        focus(0);
        break;
      case 'End':
        e.preventDefault();
        focus(tabs.length - 1);
        break;
    }
  };

  return (
    <div className="not-prose my-7">
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        className="mb-4 flex gap-1 overflow-x-auto border-b border-border"
      >
        {tabs.map((tab, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tabpanel-${i}`}
              id={`tab-${i}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(i)}
              className={[
                'shrink-0 px-3 py-2 text-sm transition-colors',
                'border-b-2 -mb-px',
                isActive
                  ? 'font-semibold text-body border-body'
                  : 'font-normal text-muted border-transparent hover:text-subtle',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-1 rounded-sm',
              ].join(' ')}
            >
              {tab.props.label}
            </button>
          );
        })}
      </div>
      {/* Only render the active panel's children. Rendering inactive
          panels with `hidden` keeps them mounted, which is fine for static
          content but can cause hydration drift with charts that measure
          themselves with ResponsiveContainer (Recharts) — they render at
          width=0 in a hidden panel during SSR, then re-render at full
          width on client mount, and any conditional inside the chart that
          depends on resolved size can drift hook count between SSR/CSR.
          Mounting only the active panel sidesteps that entirely; the
          tradeoff is that switching tabs remounts the chart (animation
          replay), which is an acceptable price. */}
      {tabs[active] && (
        <div
          key={active}
          role="tabpanel"
          id={`tabpanel-${active}`}
          aria-labelledby={`tab-${active}`}
        >
          {tabs[active].props.children}
        </div>
      )}
    </div>
  );
}
