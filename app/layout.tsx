import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { PulseWidget } from '@/components/widget/pulse-widget';
import { cn } from '@/lib/utils';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'tctPulse | Feedback Board, Public Roadmap & Changelog',
  description:
    'An all-in-one Product Feedback Board, Public Roadmap, and Changelog Hub inspired by Canny and Linear.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn('h-full antialiased font-mono', jetbrainsMono.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-mono selection:bg-foreground selection:text-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PulseWidget />
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
