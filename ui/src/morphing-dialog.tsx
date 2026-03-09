'use client'

import React, { useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, MotionConfig, Transition, Variant } from 'motion/react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/index'
import { XIcon } from 'lucide-react'
import useClickOutside from '@/hooks/useClickOutside'

export type MorphingDialogContextType = {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    uniqueId: string
    triggerRef: React.RefObject<HTMLElement | null>
}

const MorphingDialogContext = React.createContext<MorphingDialogContextType | null>(null)

function useMorphingDialog() {
    const context = useContext(MorphingDialogContext)
    if (!context) {
        throw new Error('useMorphingDialog must be used within a MorphingDialogProvider')
    }
    return context
}

export type MorphingDialogProviderProps = {
    children: React.ReactNode
    transition?: Transition
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

function MorphingDialogProvider({
    children,
    transition,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: MorphingDialogProviderProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

    const setIsOpen = useCallback(
        (value: boolean) => {
            if (setControlledOpen) {
                setControlledOpen(value)
            } else {
                setInternalOpen(value)
            }
        },
        [setControlledOpen]
    )

    const uniqueId = useId()
    const triggerRef = useRef<HTMLElement>(null!)

    const contextValue = useMemo(
        () => ({
            isOpen,
            setIsOpen,
            uniqueId,
            triggerRef,
        }),
        [isOpen, setIsOpen, uniqueId]
    )

    return (
        <MorphingDialogContext.Provider value={contextValue}>
            <MotionConfig transition={transition}>{children}</MotionConfig>
        </MorphingDialogContext.Provider>
    )
}

export type MorphingDialogProps = {
    children: React.ReactNode
    transition?: Transition
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

function MorphingDialog({ children, transition, open, onOpenChange }: MorphingDialogProps) {
    return (
        <MorphingDialogProvider transition={transition} open={open} onOpenChange={onOpenChange}>
            <MotionConfig transition={transition}>{children}</MotionConfig>
        </MorphingDialogProvider>
    )
}

export type MorphingDialogTriggerProps = React.ComponentProps<typeof motion.div> & {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
    triggerRef?: React.RefObject<HTMLElement>
}

function MorphingDialogTrigger({
    children,
    className,
    style,
    triggerRef: propTriggerRef,
    ...props
}: MorphingDialogTriggerProps) {
    const { setIsOpen, isOpen, uniqueId, triggerRef: contextTriggerRef } = useMorphingDialog()

    const currentTriggerRef = (propTriggerRef ||
        contextTriggerRef) as React.RefObject<HTMLDivElement>

    const handleClick = useCallback(() => {
        setIsOpen(!isOpen)
    }, [setIsOpen, isOpen])

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setIsOpen(!isOpen)
            }
        },
        [setIsOpen, isOpen]
    )

    return (
        <motion.div
            ref={currentTriggerRef}
            layoutId={`dialog-${uniqueId}`}
            className={cn('relative cursor-pointer', className)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            style={style}
            role='button'
            tabIndex={0}
            aria-haspopup='dialog'
            aria-expanded={isOpen}
            aria-controls={`motion-ui-morphing-dialog-content-${uniqueId}`}
            aria-label={`Open dialog ${uniqueId}`}
            {...props}
        >
            {children}
        </motion.div>
    )
}

export type MorphingDialogContentProps = {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

const MorphingDialogContent = React.forwardRef<HTMLDivElement, MorphingDialogContentProps>(
    ({ children, className, style }, ref) => {
        const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog()
        const containerRef = useRef<HTMLDivElement>(null!)

        // Merge forwarded ref with internal containerRef
        React.useImperativeHandle(ref, () => containerRef.current)

        const [firstFocusableElement, setFirstFocusableElement] = useState<HTMLElement | null>(null)
        const [lastFocusableElement, setLastFocusableElement] = useState<HTMLElement | null>(null)

        useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    setIsOpen(false)
                }
                if (event.key === 'Tab') {
                    if (!firstFocusableElement || !lastFocusableElement) return

                    if (event.shiftKey) {
                        if (document.activeElement === firstFocusableElement) {
                            event.preventDefault()
                            lastFocusableElement.focus()
                        }
                    } else {
                        if (document.activeElement === lastFocusableElement) {
                            event.preventDefault()
                            firstFocusableElement.focus()
                        }
                    }
                }
            }

            document.addEventListener('keydown', handleKeyDown)

            return () => {
                document.removeEventListener('keydown', handleKeyDown)
            }
        }, [setIsOpen, firstFocusableElement, lastFocusableElement])

        useEffect(() => {
            if (isOpen) {
                document.body.classList.add('overflow-hidden')
                const focusableElements = containerRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
                if (focusableElements && focusableElements.length > 0) {
                    setFirstFocusableElement(focusableElements[0] as HTMLElement)
                    setLastFocusableElement(
                        focusableElements[focusableElements.length - 1] as HTMLElement
                    )
                    ;(focusableElements[0] as HTMLElement).focus()
                }
            } else {
                document.body.classList.remove('overflow-hidden')
                triggerRef.current?.focus()
            }
        }, [isOpen, triggerRef])

        useClickOutside(containerRef, () => {
            if (isOpen) {
                setIsOpen(false)
            }
        })

        return (
            <motion.div
                ref={containerRef}
                layoutId={`dialog-${uniqueId}`}
                className={cn('overflow-hidden', className)}
                style={style}
                role='dialog'
                aria-modal='true'
                aria-labelledby={`motion-ui-morphing-dialog-title-${uniqueId}`}
                aria-describedby={`motion-ui-morphing-dialog-description-${uniqueId}`}
            >
                {children}
            </motion.div>
        )
    }
)

MorphingDialogContent.displayName = 'MorphingDialogContent'

export type MorphingDialogContainerProps = {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

function MorphingDialogContainer({ children }: MorphingDialogContainerProps) {
    const { isOpen, uniqueId } = useMorphingDialog()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return createPortal(
        <AnimatePresence initial={false} mode='sync'>
            {isOpen && (
                <>
                    <motion.div
                        key={`backdrop-${uniqueId}`}
                        className='fixed inset-0 h-full w-full bg-white/40 backdrop-blur-xs dark:bg-black/40'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <div className='fixed inset-0 z-50 flex items-center justify-center'>
                        {children}
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

export type MorphingDialogTitleProps = {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

function MorphingDialogTitle({ children, className, style }: MorphingDialogTitleProps) {
    const { uniqueId } = useMorphingDialog()

    return (
        <motion.div
            layoutId={`dialog-title-container-${uniqueId}`}
            className={className}
            style={style}
            layout
        >
            {children}
        </motion.div>
    )
}

export type MorphingDialogSubtitleProps = {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

function MorphingDialogSubtitle({ children, className, style }: MorphingDialogSubtitleProps) {
    const { uniqueId } = useMorphingDialog()

    return (
        <motion.div
            layoutId={`dialog-subtitle-container-${uniqueId}`}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    )
}

export type MorphingDialogDescriptionProps = {
    children: React.ReactNode
    className?: string
    disableLayoutAnimation?: boolean
    variants?: {
        initial: Variant
        animate: Variant
        exit: Variant
    }
}

function MorphingDialogDescription({
    children,
    className,
    variants,
    disableLayoutAnimation,
}: MorphingDialogDescriptionProps) {
    const { uniqueId } = useMorphingDialog()

    return (
        <motion.div
            key={`dialog-description-${uniqueId}`}
            layoutId={disableLayoutAnimation ? undefined : `dialog-description-content-${uniqueId}`}
            variants={variants}
            className={className}
            initial='initial'
            animate='animate'
            exit='exit'
            id={`dialog-description-${uniqueId}`}
        >
            {children}
        </motion.div>
    )
}

export type MorphingDialogImageProps = {
    src: string
    alt: string
    className?: string
    style?: React.CSSProperties
}

function MorphingDialogImage({ src, alt, className, style }: MorphingDialogImageProps) {
    const { uniqueId } = useMorphingDialog()

    return (
        <motion.img
            src={src}
            alt={alt}
            className={cn(className)}
            layoutId={`dialog-img-${uniqueId}`}
            style={style}
        />
    )
}

export type MorphingDialogCloseProps = {
    children?: React.ReactNode
    className?: string
    variants?: {
        initial: Variant
        animate: Variant
        exit: Variant
    }
}

function MorphingDialogClose({ children, className, variants }: MorphingDialogCloseProps) {
    const { setIsOpen, uniqueId } = useMorphingDialog()

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [setIsOpen])

    return (
        <motion.button
            onClick={handleClose}
            type='button'
            aria-label='Close dialog'
            key={`dialog-close-${uniqueId}`}
            className={cn('absolute top-6 right-6', className)}
            initial='initial'
            animate='animate'
            exit='exit'
            variants={variants}
        >
            {children || <XIcon size={24} />}
        </motion.button>
    )
}

export type MorphingDialogBodyProps = {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

function MorphingDialogBody({ children, className, style }: MorphingDialogBodyProps) {
    const { uniqueId } = useMorphingDialog()

    return (
        <motion.div
            layoutId={`dialog-body-${uniqueId}`}
            className={cn('flex-1 overflow-y-auto', className)}
            style={style}
        >
            {children}
        </motion.div>
    )
}

export type MorphingDialogFooterProps = {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}

function MorphingDialogFooter({ children, className, style }: MorphingDialogFooterProps) {
    const { uniqueId } = useMorphingDialog()

    return (
        <motion.div
            layoutId={`dialog-footer-${uniqueId}`}
            className={cn('flex flex-col', className)}
            style={style}
        >
            {children}
        </motion.div>
    )
}

export {
    MorphingDialog,
    MorphingDialogTrigger,
    MorphingDialogContainer,
    MorphingDialogContent,
    MorphingDialogClose,
    MorphingDialogTitle,
    MorphingDialogSubtitle,
    MorphingDialogDescription,
    MorphingDialogImage,
    MorphingDialogBody,
    MorphingDialogFooter,
}
