'use client'

import { HeroUIProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import { useRouter } from 'nextjs-toploader/app'
import { useState } from 'react'

import { siteConfig } from '®/config/site'
import useScreenSize from '®/hooks/useScreenSize'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())
    const router = useRouter()
    const useHref = (href: string) => siteConfig.domain + href
    const isDevelopment = process.env.NODE_ENV === 'development'
    const screenSize = useScreenSize()

    return (
        <ThemeProvider
            disableTransitionOnChange
            enableColorScheme
            enableSystem
            attribute='class'
            defaultTheme='system'
        >
            <QueryClientProvider client={queryClient}>
                <HeroUIProvider navigate={router.push} useHref={useHref}>
                    {children}
                    <NextTopLoader color='hsl(var(--ring))' height={4} showSpinner={false} />
                    {isDevelopment && (
                        <>
                            <div className='absolute bottom-0' color='secondary'>
                                {screenSize}
                            </div>
                            {/* <ReactQueryDevtools /> */}
                        </>
                    )}
                </HeroUIProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}
