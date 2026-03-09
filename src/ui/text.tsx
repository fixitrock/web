'use client'

import { motion } from 'motion/react'

import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

type TextProps = {
    title?: string
    className?: string
}

export default function Text({ title = siteConfig.title, className }: TextProps) {
    return (
        <motion.span
            animate={{ opacity: 1, y: 0 }}
            className='relative overflow-hidden'
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
        >
            <motion.span
                animate={{
                    backgroundPosition: ['200% center', '-200% center'],
                }}
                className={cn(
                    'bg-gradient-to-r from-neutral-950 via-neutral-400 to-neutral-950 bg-[length:200%_100%] bg-clip-text text-transparent select-none dark:from-white dark:via-neutral-600 dark:to-white',
                    className
                )}
                transition={{
                    duration: 5,
                    ease: 'linear',
                    repeat: Number.POSITIVE_INFINITY,
                }}
            >
                {title}
            </motion.span>
        </motion.span>
    )
}
