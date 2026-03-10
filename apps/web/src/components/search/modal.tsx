import * as React from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { motion, Transition } from 'motion/react'

import { cn } from '@/lib/utils'
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/ui/drawer'

import {
    MorphingDialog,
    MorphingDialogTrigger,
    MorphingDialogContainer,
    MorphingDialogContent,
    MorphingDialogBody,
    MorphingDialogFooter,
} from '@/ui/morphing-dialog'

interface SearchModalProps {
    trigger: React.ReactNode
    content: React.ReactNode
    footer?: React.ReactNode
    desktopHeight?: string
    mobileHeight?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
    setOpen?: (open: boolean) => void
    animate?: any
    variants?: any
    initial?: any
    exit?: any
    transition?: Transition
}

export const SearchModal = React.forwardRef<HTMLDivElement, SearchModalProps>(
    (
        {
            trigger,
            content,
            footer,
            desktopHeight = '50vh',
            mobileHeight = '80vh',
            open,
            onOpenChange,
            setOpen,
            animate,
            variants,
            initial,
            exit,
            transition,
        },
        ref
    ) => {
        const isDesktop = useMediaQuery('(min-width: 768px)')
        const [mounted, setMounted] = React.useState(false)

        React.useEffect(() => {
            setMounted(true)
        }, [])

        const handleOpenChange = React.useCallback(
            (value: boolean) => {
                onOpenChange?.(value)
                setOpen?.(value)
            },
            [onOpenChange, setOpen]
        )
        const isOpenClass = open
            ? 'pointer-events-none invisible opacity-0 scale-95'
            : 'visible opacity-100 scale-100'

        const commonTriggerClass = cn(
            'bg-background fixed bottom-4 left-1/2 z-50 w-[95%] -translate-x-1/2 border md:w-[640px]',
            isOpenClass
        )

        if (!mounted) {
            return (
                <div className='flex items-center justify-center'>
                    <div style={{ borderRadius: 12 }} className={commonTriggerClass}>
                        {trigger}
                    </div>
                </div>
            )
        }

        return (
            <div className='flex items-center justify-center'>
                {isDesktop ? (
                    <MorphingDialog
                        open={open}
                        onOpenChange={handleOpenChange}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 22,
                        }}
                    >
                        <MorphingDialogTrigger
                            animate={animate}
                            variants={variants}
                            initial={initial}
                            exit={exit}
                            transition={
                                transition || { type: 'spring', stiffness: 350, damping: 35 }
                            }
                            style={{ borderRadius: 12 }}
                            className={commonTriggerClass}
                        >
                            {trigger}
                        </MorphingDialogTrigger>

                        <MorphingDialogContainer>
                            <MorphingDialogContent
                                ref={ref}
                                style={{ borderRadius: 12, height: desktopHeight }}
                                className='bg-background relative flex w-2xl flex-col border'
                            >
                                <MorphingDialogBody className='p-0'>
                                    <div data-slot='MorphingDialog-content'>{content}</div>
                                </MorphingDialogBody>
                                {footer && (
                                    <MorphingDialogFooter className='border-t'>
                                        {footer}
                                    </MorphingDialogFooter>
                                )}
                            </MorphingDialogContent>
                        </MorphingDialogContainer>
                    </MorphingDialog>
                ) : (
                    <Drawer open={open} onOpenChange={handleOpenChange}>
                        <DrawerTrigger asChild>
                            <motion.div
                                animate={animate}
                                variants={variants}
                                initial={initial}
                                exit={exit}
                                transition={
                                    transition || { type: 'spring', stiffness: 350, damping: 35 }
                                }
                                className={commonTriggerClass}
                                style={{ borderRadius: 12 }}
                            >
                                {trigger}
                            </motion.div>
                        </DrawerTrigger>

                        <DrawerContent
                            ref={ref}
                            className='p-0'
                            style={{ height: mobileHeight }}
                            showbar
                        >
                            <DrawerHeader className='sr-only'>
                                <DrawerTitle />
                                <DrawerDescription />
                            </DrawerHeader>
                            <DrawerBody className='p-0'>{content}</DrawerBody>
                            {footer && (
                                <DrawerFooter className='gap-0 border-t p-0'>{footer}</DrawerFooter>
                            )}
                        </DrawerContent>
                    </Drawer>
                )}
            </div>
        )
    }
)

SearchModal.displayName = 'SearchModal'
