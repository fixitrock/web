'use client'

import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import { useRouter } from 'nextjs-toploader/app'
import { useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { siteConfig } from '@/config/site'
import { useOpen } from '@/zustand/store'
import { Toaster } from '@/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())
    const router = useRouter()
    const useHref = (href: string) => siteConfig.domain + href

    useOpen()

    return (
        <ThemeProvider
            disableTransitionOnChange
            enableColorScheme
            enableSystem
            attribute='class'
            defaultTheme='system'
        >
            <QueryClientProvider client={queryClient}>
                <HeroUIProvider navigate={router.push} spinnerVariant='spinner' useHref={useHref}>
                    <ToastProvider
                        maxVisibleToasts={9}
                        toastProps={{ radius: 'lg', classNames: { description: 'text-xs' } }}
                    />
                    {children}
                    <NextTopLoader color='red' height={2} showSpinner={false} />
                    <Toaster />
                </HeroUIProvider>
                {siteConfig.isDev && <ReactQueryDevtools />}
            </QueryClientProvider>
        </ThemeProvider>
    )
}
