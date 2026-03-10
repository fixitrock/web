'use client'
import { motion } from 'motion/react'
import React from 'react'

import { AnimatedTAGProps } from '@/types/drive'

const AnimatedDiv = React.forwardRef<HTMLDivElement, AnimatedTAGProps>(
    ({ variants, mobileVariants, className, children, infinity, ...motionProps }, ref) => {
        const selectedVariants =
            typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
                ? mobileVariants
                : variants

        return (
            <motion.div
                ref={ref}
                layout
                className={className}
                initial='hidden'
                transition={{
                    staggerChildren: 0.1,
                    delayChildren: 0.2,
                }}
                variants={selectedVariants}
                viewport={{ once: !infinity }}
                whileInView='visible'
                {...motionProps}
            >
                {children}
            </motion.div>
        )
    }
)

AnimatedDiv.displayName = 'AnimatedDiv'

export default AnimatedDiv
