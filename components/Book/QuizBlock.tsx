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
    <section className="not-prose my-10 rounded-md border border-slate-200 bg-slate-50 p-6">
      <header className="flex items-baseline justify-between gap-4">
        <h3 className="text-base font-semibold uppercase tracking-wide text-slate-700">
          {title}
        </h3>
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={revealAll}
            className="rounded border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-100"
          >
            Reveal all
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-100"
          >
            Reset
          </button>
        </div>
      </header>

      {intro && (
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{intro}</p>
      )}

      <ol className="mt-5 space-y-5">
        {questions.map((q, qi) => {
          const pickIndex = picks[qi];
          const isRevealed = revealed[qi];
          return (
            <li
              key={qi}
              className="rounded-md border border-slate-200 bg-white p-4"
            >
              <div className="flex gap-2 text-sm font-medium text-slate-900">
                <span className="text-slate-500">{qi + 1}.</span>
                <div className="flex-1">{q.prompt}</div>
              </div>

              <ul className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const picked = pickIndex === oi;
                  const correct = oi === q.correctIndex;
                  let stateClass = 'border-slate-200 bg-white hover:bg-slate-50';
                  if (isRevealed) {
                    if (correct) {
                      stateClass = 'border-emerald-400 bg-emerald-50 text-emerald-900';
                    } else if (picked) {
                      stateClass = 'border-rose-400 bg-rose-50 text-rose-900';
                    } else {
                      stateClass = 'border-slate-200 bg-white text-slate-500';
                    }
                  }
                  const letter = String.fromCharCode(65 + oi);
                  return (
                    <li key={oi}>
                      <button
                        type="button"
                        onClick={() => pick(qi, oi)}
                        className={`flex w-full items-start gap-3 rounded border px-3 py-2 text-left text-sm transition-colors ${stateClass}`}
                      >
                        <span className="mt-px font-semibold">{letter}.</span>
                        <span className="flex-1">{opt.label}</span>
                        {isRevealed && correct && (
                          <span aria-hidden className="text-emerald-600">✓</span>
                        )}
                        {isRevealed && picked && !correct && (
                          <span aria-hidden className="text-rose-600">✗</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {isRevealed && (
                <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                  <strong className="font-semibold text-slate-900">Why:</strong>{' '}
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
