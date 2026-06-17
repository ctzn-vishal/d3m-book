'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Dark/light toggle. The initial class is set pre-paint by the inline script in
 * layout.tsx (saved choice, else system). This button flips it and persists the
 * explicit choice. Icon is gated on mount to avoid a hydration mismatch.
 */
export function ThemeToggle() {
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-hub-line text-hub-ink-soft transition-colors hover:border-hub-line-strong hover:text-hub-ink"
    >
      {mounted ? (
        dark ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />
      ) : (
        <span className="h-[15px] w-[15px]" />
      )}
    </button>
  );
}
