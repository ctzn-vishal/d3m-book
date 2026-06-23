import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin · Sign in', robots: { index: false, follow: false } };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const noSecret = !process.env.ADMIN_SECRET;

  return (
    <div className="hub-scope flex min-h-screen items-center justify-center px-5">
      <form
        action="/api/admin/login"
        method="post"
        className="w-full max-w-sm rounded-2xl border border-hub-line bg-hub-card p-6 shadow-hub"
      >
        <div className="font-plex text-[11px] uppercase tracking-[0.16em] text-hub-amber">
          Vishal Singh · Gallery
        </div>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-hub-ink">Admin sign in</h1>
        <p className="mt-1 text-[13px] text-hub-ink-soft">Curate the gallery registry.</p>

        {next ? <input type="hidden" name="next" value={next} /> : null}

        <label className="mt-5 block font-plex text-[11px] uppercase tracking-[0.08em] text-hub-ink-faint">
          Password
        </label>
        <input
          type="password"
          name="password"
          autoFocus
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-lg border border-hub-line bg-hub-paper px-3 py-2.5 text-[14px] text-hub-ink focus:border-hub-teal focus:outline-none focus:ring-2 focus:ring-hub-teal/30"
        />

        {error ? (
          <p className="mt-3 text-[13px] text-red-600">Incorrect password.</p>
        ) : null}
        {noSecret ? (
          <p className="mt-3 text-[12px] leading-relaxed text-amber-700">
            <code>ADMIN_SECRET</code> is not set — sign-in will fail. Set it in{' '}
            <code>.env.local</code> (and Vercel) first.
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-hub-ink px-4 py-2.5 font-plex text-[12px] font-medium uppercase tracking-[0.08em] text-hub-paper transition-opacity hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
