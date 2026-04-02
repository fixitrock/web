'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme()

    return (
        <Sonner
            richColors
            className='toaster group'
            style={
                {
                    '--normal-bg': 'var(--app-popover)',
                    '--normal-text': 'var(--app-popover-foreground)',
                    '--normal-border': 'var(--app-border)',
                } as React.CSSProperties
            }
            theme={theme as ToasterProps['theme']}
            visibleToasts={9}
            {...props}
        />
    )
}

export { Toaster }
