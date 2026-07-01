import * as React from 'react';
import katex from 'katex';

export function Equation({
  latex,
  label,
}: {
  latex: string;
  label?: string;
}) {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
      });
    } catch (err) {
      console.error('KaTeX rendering error:', err);
      return `<code class="block text-center font-mono text-sm text-slate-900 dark:text-slate-100">${latex}</code>`;
    }
  }, [latex]);

  return (
    <div className="not-prose my-6 rounded-md border border-slate-200 bg-slate-50/80 px-3.5 py-3 dark:border-slate-700 dark:bg-slate-800/40">
      {label && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
      )}
      <div className="overflow-x-auto py-1.5">
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="text-center text-[0.95rem] text-slate-900 dark:text-slate-100"
        />
      </div>
    </div>
  );
}
