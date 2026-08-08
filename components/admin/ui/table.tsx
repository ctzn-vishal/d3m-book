import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Table primitives in the shadcn/ui shape (Table, TableHeader, TableRow, …) but
 * styled against this site's `--hub-*` tokens rather than shadcn's default
 * `--background`/`--foreground` set.
 *
 * Deliberately not installed via `shadcn init`: the repo already runs two
 * CSS-variable systems (`--book-*` for the reading theme, `--hub-*` for the
 * editorial surfaces) and two `cn` helpers, and init would write a third set
 * into globals.css. shadcn's Table is styling with no logic — all the behaviour
 * comes from TanStack Table — so copying the shape and dropping the theme is
 * the cheaper trade.
 */

export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto">
      <table ref={ref} className={cn('w-full caption-bottom border-collapse text-[13px]', className)} {...props} />
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('sticky top-0 z-20 bg-hub-paper2 [&_tr]:border-b [&_tr]:border-hub-line', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { selected?: boolean }
>(({ className, selected, ...props }, ref) => (
  <tr
    ref={ref}
    data-state={selected ? 'selected' : undefined}
    className={cn(
      'border-b border-hub-line transition-colors hover:bg-hub-paper2/70 data-[state=selected]:bg-hub-teal-soft/60',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-9 whitespace-nowrap px-2 text-left align-middle font-plex text-[10.5px] font-medium uppercase tracking-[0.08em] text-hub-ink-faint',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-2 py-1.5 align-middle text-hub-ink', className)} {...props} />
));
TableCell.displayName = 'TableCell';

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-3 text-[12px] text-hub-ink-faint', className)} {...props} />
));
TableCaption.displayName = 'TableCaption';
