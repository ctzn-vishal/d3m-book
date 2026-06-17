import { HubHeader } from '@/components/hub/HubHeader';
import { HubFooter } from '@/components/hub/HubFooter';

/**
 * Layout for the hub surfaces (home, gallery, research, about, teaching cover).
 * Wraps them in the warm-paper editorial scope with the shared header/footer.
 * The book's article reading pages live outside this route group and keep
 * their own (white) theme + per-article shell.
 */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hub-scope flex min-h-screen flex-col font-sans">
      <HubHeader />
      <div className="flex-grow">{children}</div>
      <HubFooter />
    </div>
  );
}
