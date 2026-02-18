'use client'

import { AnimatePresence, motion, useAnimation } from 'motion/react'
import { useEffect } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import useScroll from '@/hooks/useScroll'
import { Bottom } from '@/lib/FramerMotionVariants'

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../drawer'

interface AnimatedSearchProps {
    children: React.ReactNode
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    ref: React.RefObject<HTMLDivElement>
}

export default function AnimatedSearch({ children, open, setOpen, ref }: AnimatedSearchProps) {
    const { scrollY, direction } = useScroll()
    const isHidden = scrollY > 0 && direction === 'down'
    const controls = useAnimation()

    useEffect(() => {
        const animate = async () => await controls.start(isHidden ? 'hidden' : 'visible')

        animate()

        return () => controls.stop()
    }, [isHidden, controls])

    return (
        <div className='flex flex-col items-center justify-center'>
            <div
                key={open ? 'focused' : 'unfocused'}
                className={`${open && 'fixed inset-0 z-50 backdrop-blur-[1px]'}`}
                onClick={() => setOpen(false)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        setOpen(false)
                    }
                }}
            />
            <AnimatePresence>
                <motion.div
                    animate={controls}
                    className={`fixed bottom-4 z-50 w-[95%] md:w-160`}
                    exit='hidden'
                    initial={isHidden && !open ? 'hidden' : 'visible'}
                    transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                    variants={Bottom}
                >
                    <Modal open={open} setOpen={setOpen} ref={ref}>
                        {children}
                    </Modal>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export function Modal({ children, open, setOpen, ref }: AnimatedSearchProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)')

    if (isDesktop) {
        return (
            <div
                ref={ref}
                className={`z-50 transition-transform duration-300 ${open && 'translate-y-[-25vh] transform'}`}
            >
                {children}
            </div>
        )
    }

    return (
        <>
            {!open && <div className='z-50'>{children}</div>}
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerContent className='h-[80vh]' ref={ref}>
                    <DrawerHeader className='sr-only'>
                        <DrawerTitle />
                        <DrawerDescription />
                    </DrawerHeader>
                    {children}
                </DrawerContent>
            </Drawer>
        </>
    )
}
