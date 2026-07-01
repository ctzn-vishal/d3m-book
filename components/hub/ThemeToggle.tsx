'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const VARIANT_CLASS = {
  hub: 'border-hub-line text-hub-ink-soft hover:border-hub-line-strong hover:text-hub-ink',
  book: 'border-border text-muted hover:border-border-strong hover:text-body',
};

/**
 * Dark/light toggle. The initial class is set pre-paint by the inline script in
 * layout.tsx (saved choice, else system) — that script and the `.dark`/localStorage
 * mechanism are site-wide, so this same toggle works on both the hub and the book;
 * only the button's own border/text colors switch via `variant` to match whichever
 * chrome it's rendered in. Icon is gated on mount to avoid a hydration mismatch.
 */
export function ThemeToggle({ variant = 'hub' }: { variant?: 'hub' | 'book' }) {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${VARIANT_CLASS[variant]}`}
    >
      {mounted ? (
        dark ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />
      ) : (
        <span className="h-[15px] w-[15px]" />
      )}
    </button>
  );
}
