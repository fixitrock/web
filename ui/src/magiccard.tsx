'use client'

import { motion, useMotionTemplate, useMotionValue } from 'motion/react'
import React, { useCallback, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
    gradientSize?: number
    gradientOpacity?: number
}

export function MagicCard({
    children,
    className,
    gradientSize = 180,
    gradientOpacity = 0.8,
}: MagicCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(-gradientSize)
    const mouseY = useMotionValue(-gradientSize)

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (cardRef.current) {
                const { left, top } = cardRef.current.getBoundingClientRect()
                const clientX = e.clientX
                const clientY = e.clientY

                mouseX.set(clientX - left)
                mouseY.set(clientY - top)
            }
        },
        [mouseX, mouseY]
    )

    const handleMouseOut = useCallback(
        (e: MouseEvent) => {
            if (!e.relatedTarget) {
                document.removeEventListener('mousemove', handleMouseMove)
                mouseX.set(-gradientSize)
                mouseY.set(-gradientSize)
            }
        },
        [handleMouseMove, mouseX, gradientSize, mouseY]
    )

    const handleMouseEnter = useCallback(() => {
        document.addEventListener('mousemove', handleMouseMove)
        mouseX.set(-gradientSize)
        mouseY.set(-gradientSize)
    }, [handleMouseMove, mouseX, gradientSize, mouseY])

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseout', handleMouseOut)
        document.addEventListener('mouseenter', handleMouseEnter)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseout', handleMouseOut)
            document.removeEventListener('mouseenter', handleMouseEnter)
        }
    }, [handleMouseEnter, handleMouseMove, handleMouseOut])

    useEffect(() => {
        mouseX.set(-gradientSize)
        mouseY.set(-gradientSize)
    }, [gradientSize, mouseX, mouseY])

    return (
        <div
            ref={cardRef}
            className={cn('group relative flex size-full flex-col overflow-hidden p-1', className)}
        >
            <div className='relative z-10'>{children}</div>
            <motion.div
                className='pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                style={{
                    background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, #D9D9D955, transparent 100%)
          `,
                    opacity: gradientOpacity,
                }}
            />
        </div>
    )
}
