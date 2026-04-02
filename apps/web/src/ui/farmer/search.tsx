'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../drawer'
import { Modal } from '@heroui/react'
import { useSearchStore } from '@/zustand/store'

interface AnimatedSearchProps {
    children: React.ReactNode
}

const BLUR_CLASSES =
    'supports-backdrop-filter:backdrop-blur-xs supports-backdrop-filter:backdrop-saturate-150'
const SHELL_CLASSES = `${BLUR_CLASSES} dark:bg-[#1C1C1E]/75`

export default function AnimatedSearch({ children }: AnimatedSearchProps) {
    const isOpen = useSearchStore((s) => s.isOpen)
    return (
        <>
            {!isOpen && (
                <div
                    className={`fixed bottom-4 left-1/2 z-50 w-[95%] -translate-x-1/2 rounded-[20px] border bg-white/80 md:w-160 ${SHELL_CLASSES}`}
                >
                    {children}
                </div>
            )}
            <ModalContentWrapper>{children}</ModalContentWrapper>
        </>
    )
}

function ModalContentWrapper({ children }: AnimatedSearchProps) {
    const { isOpen, onClose, ref } = useSearchStore()
    const isDesktop = useMediaQuery('(min-width: 768px)')

    if (isDesktop) {
        return (
            <Modal>
                <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose} variant='opaque'>
                    <Modal.Container
                        className={`h-[70dvh] max-h-[calc(100%-10px)] max-w-160 rounded-[18px] border bg-white p-0.5 md:h-[60dvh] md:w-160 ${SHELL_CLASSES}`}
                        placement='top'
                    >
                        <Modal.Dialog className='flex h-full flex-col overflow-hidden'>
                            <div ref={ref} className='flex h-full flex-col overflow-hidden'>
                                {children}
                            </div>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        )
    }

    return (
        <Drawer open={isOpen} onClose={onClose}>
            <DrawerContent className={`h-[70dvh] ${SHELL_CLASSES}`} ref={ref}>
                <DrawerHeader className='sr-only'>
                    <DrawerTitle />
                    <DrawerDescription />
                </DrawerHeader>
                {children}
            </DrawerContent>
        </Drawer>
    )
}




