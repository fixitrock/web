'use client'
import { PosHeader } from './header'
import { PosCart } from './cart'
import { PosProduct } from './product'
import { useCartStore } from '@/zustand/store/cart'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { AnimatePresence, motion } from 'motion/react'

export function Pos() {
    const { showCart } = useCartStore()
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const showProduct = isDesktop || !showCart
    const showCartContent = showCart

    // Animation Variants
    const productVariants = {
        initial: isDesktop ? { opacity: 0, scale: 0.98 } : { x: -20, opacity: 0 },
        animate: { opacity: 1, scale: 1, x: 0 },
        exit: isDesktop ? { opacity: 0, scale: 0.98 } : { x: -20, opacity: 0 },
    }

    const cartVariants = {
        initial: isDesktop ? { opacity: 0, width: 0 } : { x: 20, opacity: 0 },
        animate: {
            opacity: 1,
            width: isDesktop ? 384 : '100%',
            x: 0,
        },
        exit: isDesktop ? { opacity: 0, width: 0 } : { x: 20, opacity: 0 },
    }

    return (
        <main className='flex h-[calc(100svh-78px)] flex-col gap-2 p-2 2xl:px-[10%]'>
            <PosHeader />
            <div className='relative flex flex-1 gap-2 overflow-hidden'>
                <AnimatePresence initial={false} mode={isDesktop ? 'sync' : 'popLayout'}>
                    {showProduct && (
                        <motion.div
                            key='product-section'
                            variants={productVariants}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                            className='min-w-0 flex-1'
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <PosProduct />
                        </motion.div>
                    )}

                    {showCartContent && (
                        <motion.div
                            key='cart-section'
                            variants={cartVariants}
                            initial='initial'
                            animate='animate'
                            exit='exit'
                            className='h-full'
                            style={{ overflow: 'hidden' }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                            <PosCart />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    )
}
