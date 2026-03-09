'use client'
import { motion, Variants } from 'motion/react'
import React, { ReactNode } from 'react'

type PresetType =
    | 'fade'
    | 'slide'
    | 'scale'
    | 'blur'
    | 'blur-slide'
    | 'zoom'
    | 'flip'
    | 'bounce'
    | 'rotate'
    | 'swing'

type AnimatedGroupProps = {
    children: ReactNode
    className?: string
    infinity?: boolean
    variants?: {
        container?: Variants
        children?: Variants
        smContainer?: Variants
        smChildren?: Variants
    }
    preset?: PresetType
    as?: React.ElementType
    asChild?: React.ElementType
    viewport?: { once?: boolean; amount?: number }
}

const defaultContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const defaultItemVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
}

const presetVariants: Record<PresetType, { container: Variants; item: Variants }> = {
    fade: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
        },
    },
    slide: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        },
    },
    scale: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1 },
        },
    },
    blur: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, filter: 'blur(4px)' },
            visible: { opacity: 1, filter: 'blur(0px)' },
        },
    },
    'blur-slide': {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, filter: 'blur(4px)', y: 20 },
            visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
        },
    },
    zoom: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, scale: 0.5 },
            visible: {
                opacity: 1,
                scale: 1,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
            },
        },
    },
    flip: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, rotateX: -90 },
            visible: {
                opacity: 1,
                rotateX: 0,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
            },
        },
    },
    bounce: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, y: -50 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 400, damping: 10 },
            },
        },
    },
    rotate: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, rotate: -180 },
            visible: {
                opacity: 1,
                rotate: 0,
                transition: { type: 'spring', stiffness: 200, damping: 15 },
            },
        },
    },
    swing: {
        container: defaultContainerVariants,
        item: {
            hidden: { opacity: 0, rotate: -10 },
            visible: {
                opacity: 1,
                rotate: 0,
                transition: { type: 'spring', stiffness: 300, damping: 8 },
            },
        },
    },
}

function AnimatedGroup({
    children,
    className,
    variants,
    preset,
    as = 'div',
    asChild = 'div',
    infinity,
}: AnimatedGroupProps) {
    const issm = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches

    const selectedVariants = preset
        ? presetVariants[preset]
        : { container: defaultContainerVariants, item: defaultItemVariants }

    const containerVariants =
        issm && variants?.smContainer
            ? variants.smContainer
            : variants?.container || selectedVariants.container

    const itemVariants =
        issm && variants?.smChildren
            ? variants.smChildren
            : variants?.children || selectedVariants.item

    const MotionComponent = motion(as) || motion.div
    const MotionChild = motion(asChild) || motion.div

    return (
        <MotionComponent
            layout
            className={className}
            initial='hidden'
            variants={containerVariants}
            whileInView='visible'
        >
            {React.Children.map(children, (child, index) => (
                <MotionChild
                    key={index}
                    layout
                    initial='hidden'
                    variants={itemVariants}
                    viewport={{ once: !infinity }}
                    whileInView='visible'
                >
                    {child}
                </MotionChild>
            ))}
        </MotionComponent>
    )
}

export { AnimatedGroup }
