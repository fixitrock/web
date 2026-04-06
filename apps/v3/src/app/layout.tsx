import type { Metadata, Viewport } from 'next'
import { Footer, Provider, SearchBar } from '@fixitrock/web/ui'

import '../styles/globals.css'
import { cn, siteConfig } from '@fixitrock/web'
import { fontMono, fontSans } from '@/config/fonts'

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body
                className={cn(
                    'text-foreground bg-background min-h-screen font-sans antialiased',
                    fontSans.variable,
                    fontMono.variable
                )}
            >
                <Provider>
                    <div className='relative flex h-screen flex-col'>
                        <main className='grow'>{children}</main>
                        <Footer />
                        <SearchBar />
                    </div>
                </Provider>
            </body>
        </html>
    )
}

export const metadata: Metadata = {
    title: {
        default: siteConfig.title,
        template: `%s ~ ${siteConfig.title}`,
    },
    description: siteConfig.description,
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: `${siteConfig.title}`,
        startupImage: [
            {
                url: '/icons/fixitrock.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icons/fixitrock.png',
                media: '(prefers-color-scheme: dark)',
            },
        ],
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/icons/android-chrome-192x192.png',
    },
    metadataBase: new URL(siteConfig.domain),
    manifest: '/manifest.webmanifest',
    openGraph: {
        title: siteConfig.title,
        description: siteConfig.description,
        url: new URL(siteConfig.domain),
        siteName: siteConfig.title,
        type: 'website',
        images: '/space/og',
        locale: 'en_US',
    },
    category: 'technology',
}

export const viewport: Viewport = {
    themeColor: [
        { color: '#ffffff', media: '(prefers-color-scheme: light)' },
        { color: '#000000', media: '(prefers-color-scheme: dark)' },
    ],
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
}