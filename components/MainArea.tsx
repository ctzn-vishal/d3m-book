import * as React from 'react';

/**
 * Wraps the page body. The boilerplate has no fixed site header, so
 * pages render flush to the top of the viewport. The article shell
 * (`BookShell`) supplies its own sticky header per article.
 */
export function MainArea({ children }: { children: React.ReactNode }) {
  return <main className="flex-grow">{children}</main>;
}
