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
      return `<code class="block text-center font-mono text-sm text-body">${latex}</code>`;
    }
  }, [latex]);

  return (
    <div className="not-prose my-6 rounded-md border border-border bg-card/80 px-3.5 py-3">
      {label && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
      )}
      <div className="overflow-x-auto py-1.5">
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="text-center text-[0.95rem] text-body"
        />
      </div>
    </div>
  );
}
