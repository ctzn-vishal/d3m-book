import type { MDXComponents } from 'mdx/types';
import * as React from 'react';
import katex from 'katex';

function parseMath(text: string): (string | React.JSX.Element)[] {
  const results: (string | React.JSX.Element)[] = [];
  let lastIndex = 0;
  let i = 0;

  while (i < text.length) {
    // Check for display math first: $$
    if (text.startsWith('$$', i)) {
      const start = i;
      const close = text.indexOf('$$', start + 2);
      if (close !== -1) {
        const mathContent = text.slice(start + 2, close);
        if (start > lastIndex) {
          results.push(text.slice(lastIndex, start));
        }
        try {
          const html = katex.renderToString(mathContent, {
            displayMode: true,
            throwOnError: false,
          });
          results.push(
            <span
              key={`display-${start}`}
              dangerouslySetInnerHTML={{ __html: html }}
              className="not-prose block my-4 overflow-x-auto text-center"
            />
          );
        } catch (err) {
          results.push(
            <code key={`display-err-${start}`} className="block text-center font-mono text-sm text-slate-900">
              {text.slice(start, close + 2)}
            </code>
          );
        }
        i = close + 2;
        lastIndex = i;
        continue;
      }
    }

    // Check for inline math: $
    if (text[i] === '$') {
      const start = i;
      const close = text.indexOf('$', start + 1);
      if (close !== -1) {
        const mathContent = text.slice(start + 1, close);
        // Standard rules for inline math:
        // 1. Content is not empty
        // 2. Doesn't start or end with space
        // 3. Doesn't contain newlines
        const isValidInlineMath =
          mathContent.length > 0 &&
          !mathContent.startsWith(' ') &&
          !mathContent.endsWith(' ') &&
          !mathContent.includes('\n') &&
          !mathContent.includes('\r');

        if (isValidInlineMath) {
          if (start > lastIndex) {
            results.push(text.slice(lastIndex, start));
          }
          try {
            const html = katex.renderToString(mathContent, {
              displayMode: false,
              throwOnError: false,
            });
            results.push(
              <span
                key={`inline-${start}`}
                dangerouslySetInnerHTML={{ __html: html }}
                className="not-prose inline-block mx-0.5"
              />
            );
          } catch (err) {
            results.push(
              <code key={`inline-err-${start}`} className="font-mono text-xs text-slate-900">
                {text.slice(start, close + 1)}
              </code>
            );
          }
          i = close + 1;
          lastIndex = i;
          continue;
        }
      }
    }

    i++;
  }

  if (lastIndex < text.length) {
    results.push(text.slice(lastIndex));
  }

  return results;
}

function processMathChildren(children: React.ReactNode): React.ReactNode {
  if (children === null || children === undefined) {
    return children;
  }

  if (typeof children === 'string') {
    const parsed = parseMath(children);
    if (parsed.length === 1 && typeof parsed[0] === 'string') {
      return parsed[0];
    }
    return <React.Fragment>{parsed}</React.Fragment>;
  }

  if (typeof children === 'number' || typeof children === 'boolean') {
    return children;
  }

  if (Array.isArray(children)) {
    return React.Children.map(children, child => processMathChildren(child));
  }

  if (React.isValidElement(children)) {
    const type = children.type;
    // Skip processing children of code, pre, raw textareas/inputs/scripts/styles
    if (
      type === 'code' ||
      type === 'pre' ||
      type === 'textarea' ||
      type === 'input' ||
      type === 'script' ||
      type === 'style'
    ) {
      return children;
    }

    const element = children as React.ReactElement<any>;
    if (element.props && element.props.children) {
      return React.cloneElement(element, {
        ...element.props,
        children: processMathChildren(element.props.children),
      });
    }
  }

  return children;
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    p: ({ children, ...props }: any) => (
      <p {...props}>{processMathChildren(children)}</p>
    ),
    li: ({ children, ...props }: any) => (
      <li {...props}>{processMathChildren(children)}</li>
    ),
    td: ({ children, ...props }: any) => (
      <td {...props}>{processMathChildren(children)}</td>
    ),
    th: ({ children, ...props }: any) => (
      <th {...props}>{processMathChildren(children)}</th>
    ),
    strong: ({ children, ...props }: any) => (
      <strong {...props}>{processMathChildren(children)}</strong>
    ),
    em: ({ children, ...props }: any) => (
      <em {...props}>{processMathChildren(children)}</em>
    ),
    h1: ({ children, ...props }: any) => (
      <h1 {...props}>{processMathChildren(children)}</h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 {...props}>{processMathChildren(children)}</h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 {...props}>{processMathChildren(children)}</h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 {...props}>{processMathChildren(children)}</h4>
    ),
    h5: ({ children, ...props }: any) => (
      <h5 {...props}>{processMathChildren(children)}</h5>
    ),
    h6: ({ children, ...props }: any) => (
      <h6 {...props}>{processMathChildren(children)}</h6>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote {...props}>{processMathChildren(children)}</blockquote>
    ),
  };
}

