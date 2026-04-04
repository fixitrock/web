import type { Metadata, Viewport } from 'next'
import { Footer, Provider } from '@fixitrock/web/ui'

import '../styles/globals.css'
import { cn } from '@fixitrock/web'
import { fontMono, fontSans } from '@/config/fonts'

export const metadata: Metadata = {
    title: 'V3',
    description: 'Clean Next.js app using HeroUI through @fixitrock/web.',
}

export const viewport: Viewport = {
    themeColor: '#0a0a0a',
    width: 'device-width',
    initialScale: 1,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html
            lang='en'
            className={`${fontSans.variable} ${fontMono.variable}`}
            suppressHydrationWarning
        >
            <body
                className={cn('bg-background text-foreground min-h-screen font-sans antialiased')}
            >
                <Provider>
                    <div className='relative flex h-screen flex-col'>
                        <main className='grow'>{children}</main>
                        <Footer />
                    </div>
                </Provider>
            </body>
        </html>
    )
}
