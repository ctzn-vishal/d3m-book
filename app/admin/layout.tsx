import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="hub-scope min-h-screen font-sans">{children}</div>;
}
