'use client'

import { Toast } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import { useState } from 'react'

import { RealtimeInvalidationProvider } from '@/provider/realtime-invalidation'
import { Toaster } from '@/ui/sonner'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <ThemeProvider
            disableTransitionOnChange
            enableColorScheme
            enableSystem
            attribute='class'
            defaultTheme='system'
        >
            <QueryClientProvider client={queryClient}>
                <RealtimeInvalidationProvider />
                <Toast.Provider maxVisibleToasts={9} />
                {children}
                <NextTopLoader color='red' height={2} showSpinner={false} />
                <Toaster />
                {/* {siteConfig.isDev && <ReactQueryDevtools />} */}
            </QueryClientProvider>
        </ThemeProvider>
    )
}




