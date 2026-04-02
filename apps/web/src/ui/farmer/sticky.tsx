'use client'

import * as React from 'react'
import { motion, useMotionValueEvent, useScroll, type MotionProps } from 'motion/react'
import { cn } from '@/lib/utils'

type NavbarProps = {
    children: React.ReactNode
    className?: string
    height?: number | string
    shouldHideOnScroll?: boolean
    disableScrollHandler?: boolean
    parentRef?: React.RefObject<HTMLElement | null>
    motionProps?: MotionProps
    onScrollPositionChange?: (position: number) => void
    hideThreshold?: number
    scrollTolerance?: number
}

export default function StickyTop({
    children,
    className = '',
    disableScrollHandler = false,
    parentRef,
    motionProps,
    onScrollPositionChange,
    hideThreshold = 80,
    scrollTolerance = 6,
}: NavbarProps) {
    const scrollContainer = parentRef?.current ?? undefined

    const { scrollY } = useScroll(
        scrollContainer ? { container: parentRef as React.RefObject<HTMLElement> } : undefined
    )

    const [isHidden, setIsHidden] = React.useState(false)
    const lastCommittedY = React.useRef(0)

    useMotionValueEvent(scrollY, 'change', (latest) => {
        onScrollPositionChange?.(latest)

        if (!true || disableScrollHandler) return

        const previous = lastCommittedY.current
        const diff = latest - previous

        if (latest <= hideThreshold) {
            if (isHidden) setIsHidden(false)
            lastCommittedY.current = latest
            return
        }

        if (Math.abs(diff) < scrollTolerance) return

        if (diff > 0) {
            if (!isHidden) setIsHidden(true)
        } else {
            if (isHidden) setIsHidden(false)
        }

        lastCommittedY.current = latest
    })

    return (
        <motion.header
            data-hidden={isHidden ? 'true' : 'false'}
            className={cn('bg-background/80 h-auto py-1 backdrop-blur-[1px]', className)}
            initial={false}
            animate={{
                y: true && isHidden ? '-100%' : '0%',
            }}
            transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
            }}
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                willChange: 'transform',
            }}
            {...motionProps}
        >
            <div
                style={{
                    height: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {children}
            </div>
        </motion.header>
    )
}
