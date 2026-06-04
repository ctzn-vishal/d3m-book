import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import { MainArea } from '@/components/MainArea';
import { book } from '@/lib/book-toc';
import { createPreviewMetadata, getMetadataBase } from '@/lib/share-metadata';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: book.title,
  description: book.subtitle,
  ...createPreviewMetadata(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen flex flex-col font-sans bg-brand-bg text-brand-text selection:bg-brand-primary/30`}
      >
        <MainArea>{children}</MainArea>
      </body>
    </html>
  );
}
