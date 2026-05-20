import * as React from 'react';
import katex from 'katex';

/**
 * Inline KaTeX math.
 *
 * Use as <M>{String.raw`Y_{it} = \beta_0 + \beta_1 x`}</M> in MDX prose.
 * String.raw avoids the need for double backslashes on every \beta, \frac, etc.
 *
 * For display equations, use <Equation latex="..." /> instead.
 */
export function M({ children }: { children: string }) {
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(children, {
        displayMode: false,
        throwOnError: false,
      });
    } catch (err) {
      console.error('KaTeX inline rendering error:', err);
      return `<code class="font-mono text-xs text-slate-900">${children}</code>`;
    }
  }, [children]);

  return (
    <span
      className="not-prose inline-block mx-0.5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
