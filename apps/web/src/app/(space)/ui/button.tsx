'use client'

import { Button } from '@heroui/react'

export function SpaceButton({
    icon,
    label,
    className,
    isPending = false,
    onPress,
}: {
    icon: React.ReactNode
    label: string
    className?: string
    isPending?: boolean
    onPress?: () => void
}) {
    return (
        <Button
            isIconOnly
            aria-label={label}
            className={`bg-background size-8 min-w-0 shrink-0 rounded-full border ${className || ''}`}
            isPending={isPending}
            size='sm'
            variant='ghost'
            onPress={onPress}
        >
            {icon}
        </Button>
    )
}
