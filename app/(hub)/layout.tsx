import { HubHeader } from '@/components/hub/HubHeader';
import { HubFooter } from '@/components/hub/HubFooter';
import { ScrollToTop } from '@/components/hub/ScrollToTop';

/**
 * Layout for the hub surfaces (home, gallery, research, about).
 * Wraps them in the warm-paper editorial scope with the shared header/footer.
 * The book (cover, part pages, and article reading pages) lives outside this
 * route group and keeps its own (white) theme + book chrome.
 */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hub-scope flex min-h-screen flex-col font-sans">
      <HubHeader />
      <div className="flex-grow">{children}</div>
      <HubFooter />
      <ScrollToTop />
    </div>
  );
}
