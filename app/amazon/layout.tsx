import { HubHeader } from '@/components/hub/HubHeader';
import { HubFooter } from '@/components/hub/HubFooter';
import { AmazonNav } from '@/components/amazon/AmazonNav';
import { ScrollToTop } from '@/components/hub/ScrollToTop';

/**
 * Shell for every /amazon surface. Same warm-paper editorial scope as the rest
 * of the hub, plus a sticky sub-nav listing the analyses.
 *
 * Deliberately its own route group rather than a child of (hub): these pages
 * want the project sub-nav, and the hub's other surfaces do not.
 */
export default function AmazonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hub-scope flex min-h-screen flex-col font-sans">
      <HubHeader />
      <AmazonNav />
      <div className="flex-grow">{children}</div>
      <HubFooter />
      <ScrollToTop />
    </div>
  );
}
