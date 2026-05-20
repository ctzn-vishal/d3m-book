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
      return `<code class="block text-center font-mono text-sm text-slate-900">${latex}</code>`;
    }
  }, [latex]);

  return (
    <div className="not-prose my-6 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      )}
      <div className="overflow-x-auto py-2">
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="text-center text-slate-900"
        />
      </div>
    </div>
  );
}

