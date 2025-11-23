import type { Metadata, Viewport } from 'next'

import { UserDrawer } from '@/app/[user]/ui'
import Footer from '@/components/footer'
import { siteConfig } from '@/config/site'
import { AuthProvider, Providers } from '@/provider'
import '../styles/globals.css'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/search/bar'
import { fontVariables } from '@/lib/fonts'
import { ErrorBoundary } from '@/components/error'
import { userSession } from '@/actions/user'
import { ThemeMetaTag } from '@/components/theme-meta'

export default async function RootLayout({
    children,
    modal,
}: Readonly<{
    children: React.ReactNode
    modal: React.ReactNode
}>) {
    const { user, navigation, command } = await userSession()

    return (
        <html suppressHydrationWarning lang='en'>
            <body className={cn('bg-background min-h-svh font-sans antialiased', fontVariables)}>
                <AuthProvider>
                    <ErrorBoundary>
                        <Providers>
                            <ThemeMetaTag />
                            <div className='bg-background relative flex min-h-screen flex-col'>
                                <div className='flex-1 overflow-clip'>{children}</div>
                                {modal}
                                <SearchBar command={command} user={user}>
                                    <UserDrawer navigation={navigation} user={user} />
                                </SearchBar>
                                <Footer />
                            </div>
                        </Providers>
                    </ErrorBoundary>
                </AuthProvider>
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
    manifest: "/manifest.webmanifest",
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
