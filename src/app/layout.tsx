import type { Metadata, Viewport } from 'next'

import { UserDrawer } from '@/app/[user]/ui'
import Footer from '@/components/footer'
import { META_THEME_COLORS, siteConfig } from '@/config/site'
import { AuthProvider, Providers } from '@/provider'
import '../styles/globals.css'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/search/bar'
import { fontVariables } from '@/lib/fonts'
import { ErrorBoundary } from '@/components/error'
import { userSession } from '@/actions/user'

export default async function RootLayout({
    children,
    modal,
}: Readonly<{
    children: React.ReactNode
    modal?: React.ReactNode
}>) {
    const { user, navigation, command } = await userSession()

    return (
        <html suppressHydrationWarning lang='en'>
            <head>
                <meta content={META_THEME_COLORS.light} name='theme-color' />
            </head>
            <body className={cn('font-sans antialiased', fontVariables)}>
                <AuthProvider>
                    <ErrorBoundary>
                        <Providers>
                            <div className='bg-background relative z-10 flex min-h-screen flex-col'>
                                <main className='flex flex-1 flex-col'>{children}</main>
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
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: `${siteConfig.title}`,
        startupImage: ['/icons/fixitrock.png'],
    },
    icons: {
        icon: '/favicon.ico',
    },
    metadataBase: new URL(siteConfig.domain),
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
        { color: '#fff', media: '(prefers-color-scheme: light)' },
        { color: '#000', media: '(prefers-color-scheme: dark)' },
    ],
    maximumScale: 1,
    userScalable: false,
    width: 'device-width',
    initialScale: 1,
}
