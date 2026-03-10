import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.fixitrock.com'),
  title: {
    default: 'Fixitrock',
    template: '%s | Fixitrock',
  },
  description:
    'Documentation for Fixitrock users and sellers, covering Space downloads, storefront setup, products, POS, orders, and daily operations.',
  applicationName: 'Fixitrock',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/fixitrock.png',
  },
  openGraph: {
    title: 'Fixitrock',
    description:
      'Practical docs for customers and sellers using Fixitrock across Space, FRP, storefronts, products, and orders.',
    siteName: 'Fixitrock',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fixitrock',
    description:
      'Practical docs for customers and sellers using Fixitrock across Space, FRP, storefronts, products, and orders.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
