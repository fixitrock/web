'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../drawer'
import { Modal, ModalContent } from '@heroui/react'
import { useSearchStore } from '@/zustand/store'

interface AnimatedSearchProps {
    children: React.ReactNode
}

const BLUR_CLASSES =
    'supports-backdrop-filter:backdrop-blur-xs supports-backdrop-filter:backdrop-saturate-150'
const SHELL_CLASSES = `${BLUR_CLASSES} dark:bg-[#1C1C1E]/75`

export default function AnimatedSearch({ children }: AnimatedSearchProps) {
    const isOpen = useSearchStore((s) => s.isOpen)

    if (!isOpen) {
        return (
            <div
                className={`fixed bottom-4 left-1/2 z-50 w-[95%] -translate-x-1/2 rounded-[20px] border bg-white/80 md:w-160 ${SHELL_CLASSES}`}
            >
                {children}
            </div>
        )
    }

    return <ModalContentWrapper>{children}</ModalContentWrapper>
}

function ModalContentWrapper({ children }: AnimatedSearchProps) {
    const { isOpen, onClose, ref } = useSearchStore()
    const isDesktop = useMediaQuery('(min-width: 768px)')

    if (isDesktop) {
        return (
            <Modal
                ref={ref}
                hideCloseButton
                backdrop='opaque'
                classNames={{
                    base: [
                        'mt-[20dvh] flex h-[50vh] max-h-[calc(100%_-_10px)] max-w-160 flex-col',
                        'p-0.5',
                        `rounded-[18px] border bg-white md:w-160 ${SHELL_CLASSES}`,
                    ],
                }}
                isOpen={isOpen}
                shadow='none'
                motionProps={{
                    transition: { type: 'spring', stiffness: 350, damping: 35 },
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                duration: 0.3,
                                ease: 'easeOut',
                            },
                        },
                        exit: {
                            y: '50dvh',
                            opacity: 0,
                            transition: {
                                duration: 0.25,
                                ease: 'easeInOut',
                            },
                        },
                    },
                }}
                onClose={onClose}
            >
                <ModalContent>{children}</ModalContent>
            </Modal>
        )
    }

    return (
        <Drawer open={isOpen} onClose={onClose}>
            <DrawerContent className={`h-[50dvh] ${SHELL_CLASSES}`} ref={ref}>
                <DrawerHeader className='sr-only'>
                    <DrawerTitle />
                    <DrawerDescription />
                </DrawerHeader>
                {children}
            </DrawerContent>
        </Drawer>
    )
}
