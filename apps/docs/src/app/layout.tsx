import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { RootProvider } from 'fumadocs-ui/provider/next'
import './global.css'

const geistSans = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
})

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_DOCS_URL || 'https://docs.fixitrock.com'),
    title: {
        default: 'Fix iT Rock',
        template: '%s | Fix iT Rock',
    },
    description:
        'Documentation for Fix iT Rock users and sellers, covering Space downloads, storefront setup, products, POS, orders, and daily operations.',
    applicationName: 'Fix iT Rock',
    icons: {
        icon: '/favicon.ico',
        apple: '/icons/fixitrock.png',
    },
    openGraph: {
        title: 'Fix iT Rock',
        description:
            'Practical docs for customers and sellers using Fix iT Rock across Space, FRP, storefronts, products, and orders.',
        siteName: 'Fix iT Rock',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Fix iT Rock',
        description:
            'Practical docs for customers and sellers using Fix iT Rock across Space, FRP, storefronts, products, and orders.',
    },
}

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#111111' },
    ],
}

export default function Layout({ children }: LayoutProps<'/'>) {
    return (
        <html
            lang='en'
            className={`${geistSans.variable} ${geistMono.variable}`}
            suppressHydrationWarning
        >
            <body className='min-h-screen font-sans antialiased'>
                <RootProvider>{children}</RootProvider>
            </body>
        </html>
    )
}
