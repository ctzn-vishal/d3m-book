'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

/** Ring geometry — r is chosen so the 2px stroke sits inside a 44px hit target. */
const R = 19;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Floating back-to-top control for the long hub surfaces.
 *
 * The gallery is ~180 cards — sixteen-odd viewports — and the sticky filter bar
 * only helps you re-filter, not re-orient. So this does two jobs: the button
 * returns you to the top, and the ring around it reports how far down the page
 * you actually are, which is the part a plain arrow leaves out.
 *
 * Appears after roughly one viewport of scrolling, so short pages never show it.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  // rAF-throttled: scroll fires far faster than we can usefully repaint, and
  // this sits on top of a framer-motion grid that is already animating.
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const read = () => {
      frame.current = null;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(y > Math.max(600, window.innerHeight * 0.8));
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    const onScroll = () => {
      if (frame.current === null) frame.current = window.requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  const toTop = useCallback(() => {
    // Smooth-scrolling twenty-five thousand pixels is unpleasant for anyone who
    // has asked the OS to reduce motion, so honour that and jump instead.
    // Must be 'instant', not 'auto': globals.css sets `scroll-behavior: smooth`
    // on the root, and 'auto' defers to that declaration rather than overriding
    // it — so 'auto' here would still animate.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={toTop}
          aria-label="Back to top"
          title="Back to top"
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="group fixed bottom-6 right-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-hub-line-strong bg-hub-card/95 text-hub-ink-soft shadow-hub backdrop-blur-md transition-colors hover:border-hub-teal hover:text-hub-teal focus-visible:border-hub-teal focus-visible:text-hub-teal sm:bottom-8 sm:right-7"
        >
          {/* Progress ring. -rotate-90 puts 0% at twelve o'clock. */}
          <svg
            aria-hidden
            viewBox="0 0 44 44"
            className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
          >
            <circle
              cx="22"
              cy="22"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-hub-line"
            />
            <circle
              cx="22"
              cy="22"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              className="text-hub-teal"
            />
          </svg>
          <ArrowUp size={16} strokeWidth={2.4} className="relative transition-transform group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
