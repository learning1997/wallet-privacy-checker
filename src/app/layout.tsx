import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fluton Privacy Checker — How Exposed Is Your Wallet?',
  description: 'Discover your on-chain privacy score and see what Fluton would protect.',
  applicationName: 'Fluton Privacy Checker',
  openGraph: {
    title: 'Fluton Privacy Checker — How Exposed Is Your Wallet?',
    description: 'Discover your on-chain privacy score and see what Fluton would protect.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
