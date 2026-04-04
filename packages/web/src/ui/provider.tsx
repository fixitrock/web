'use client'

import { ThemeProvider } from 'next-themes'

export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            // disableTransitionOnChange
            enableColorScheme
            enableSystem
            attribute='class'
            defaultTheme='system'
        >
            {children}
        </ThemeProvider>
    )
}
