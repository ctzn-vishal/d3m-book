'use client';

import * as React from 'react';

export interface QuizOption {
  label: React.ReactNode;
}

export interface QuizQuestion {
  /** The question prompt. Supports MDX/JSX (so inline math via <M> works). */
  prompt: React.ReactNode;
  /** Multiple-choice options in display order. */
  options: QuizOption[];
  /** Zero-based index of the correct option. */
  correctIndex: number;
  /** Explanation shown when the answer is revealed. Supports MDX/JSX. */
  explanation: React.ReactNode;
}

export interface QuizBlockProps {
  /** Heading shown at the top of the block (e.g. "Concept check"). */
  title?: string;
  /** Optional one-line intro under the title. */
  intro?: React.ReactNode;
  questions: QuizQuestion[];
}

/**
 * QuizBlock — a set of conceptual multiple-choice questions with hidden answers.
 *
 * Each question shows its options as clickable cards. The reader picks one;
 * the correct option is marked green, incorrect picks red, and the explanation
 * appears below. A "Reveal all" button at the bottom forces every answer open
 * without requiring a click on each question (useful for review).
 *
 * Designed for **conceptual** questions only — not "read this number from the
 * chart." Questions should test whether the reader understood the idea,
 * not whether they can scan back into the data case appendix.
 */
export function QuizBlock({ title = 'Concept check', intro, questions }: QuizBlockProps) {
  const [picks, setPicks] = React.useState<(number | null)[]>(
    () => questions.map(() => null)
  );
  const [revealed, setRevealed] = React.useState<boolean[]>(
    () => questions.map(() => false)
  );

  const pick = (qi: number, oi: number) => {
    setPicks(prev => {
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
    setRevealed(prev => {
      const next = [...prev];
      next[qi] = true;
      return next;
    });
  };

  const revealAll = () => setRevealed(questions.map(() => true));
  const reset = () => {
    setPicks(questions.map(() => null));
    setRevealed(questions.map(() => false));
  };

  return (
    <section className="not-prose my-9 rounded-md border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-none sm:p-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-300">
          {title}
        </h3>
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={revealAll}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Reveal all
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Reset
          </button>
        </div>
      </header>

      {intro && (
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{intro}</p>
      )}

      <ol className="mt-4 space-y-4">
        {questions.map((q, qi) => {
          const pickIndex = picks[qi];
          const isRevealed = revealed[qi];
          return (
            <li
              key={qi}
              className="rounded-md border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-800/40"
            >
              <div className="flex gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                <span className="text-slate-500 dark:text-slate-400">{qi + 1}.</span>
                <div className="flex-1">{q.prompt}</div>
              </div>

              <ul className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const picked = pickIndex === oi;
                  const correct = oi === q.correctIndex;
                  let stateClass = 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-700/50';
                  if (isRevealed) {
                    if (correct) {
                      stateClass = 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200';
                    } else if (picked) {
                      stateClass = 'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-200';
                    } else {
                      stateClass = 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-500';
                    }
                  }
                  const letter = String.fromCharCode(65 + oi);
                  return (
                    <li key={oi}>
                      <button
                        type="button"
                        onClick={() => pick(qi, oi)}
                        className={`flex w-full items-start gap-3 rounded-md border px-3 py-2 text-left text-sm leading-snug transition-colors ${stateClass}`}
                      >
                        <span className="mt-px font-semibold">{letter}.</span>
                        <span className="flex-1">{opt.label}</span>
                        {isRevealed && correct && (
                          <>
                            <span aria-hidden className="text-emerald-600 dark:text-emerald-400">✓</span>
                            <span className="sr-only"> (correct answer)</span>
                          </>
                        )}
                        {isRevealed && picked && !correct && (
                          <>
                            <span aria-hidden className="text-rose-600 dark:text-rose-400">✗</span>
                            <span className="sr-only"> (your answer — incorrect)</span>
                          </>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {isRevealed && (
                <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">Why:</strong>{' '}
                  {q.explanation}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
