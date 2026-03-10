'use client'

import { Skeleton } from '@heroui/react'
import { Icon as IconifyIcon, loadIcon } from '@iconify/react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type Props = {
    icon: string
    base?: string
    className?: string
    fallback?: React.ReactNode | null
    ssr?: boolean
}

function Icon({ icon, className, fallback, ssr = true, base }: Props) {
    const [loaded, setLoaded] = useState(ssr ? true : false)

    useEffect(() => {
        if (ssr) return
        let mounted = true

        loadIcon(icon)
            .then(() => mounted && setLoaded(true))
            .catch(() => mounted && setLoaded(true))

        return () => {
            mounted = false
        }
    }, [icon, ssr])

    if (!loaded) {
        return fallback || <Skeleton className={cn('rounded-sm', className)} />
    }

    return (
        <div className={cn('flex shrink-0 items-center justify-center', base)}>
            <IconifyIcon className={className} icon={icon} />
        </div>
    )
}

Icon.displayName = 'Icon'

export default Icon
