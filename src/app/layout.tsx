import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';

import './globals.css';

const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
});

const manrope = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Event Ops Starter',
  description:
    'AI-ready starter for public event pages, attendee journeys, and operator-grade admin workflows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable}`}>
        {children}
      </body>
    </html>
  );
}
