'use client'
import { PosHeader } from './header'
import { PosCart } from './cart'
import { PosProduct } from './product'
import { useCartStore } from '@/zustand/store'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'

export function Pos() {
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const showCart = useCartStore((s) => s.showCart)
    const isMobileCartActive = !isDesktop && showCart
    return (
        <main className='flex h-[calc(100dvh-78px)] flex-col gap-2 p-2 2xl:px-[10%]'>
            <PosHeader />

            <div className='relative flex flex-1 gap-2 overflow-hidden'>
                <PosProduct
                    className={cn(
                        'transition-[width,transform,opacity] duration-300 ease-in-out',
                        isDesktop && showCart && 'md:w-[calc(100%-380px)]',
                        isMobileCartActive && 'pointer-events-none -translate-x-full opacity-0',
                        !showCart && 'w-full'
                    )}
                />
                <PosCart
                    className={cn(
                        'transition-[width,transform,opacity] duration-300 ease-in-out',
                        isDesktop
                            ? showCart
                                ? 'w-95 translate-x-0 opacity-100'
                                : 'pointer-events-none w-0 translate-x-4 opacity-0'
                            : [
                                  'bg-background absolute inset-y-0 right-0 w-full',
                                  showCart
                                      ? 'translate-x-0 opacity-100'
                                      : 'pointer-events-none translate-x-full opacity-0',
                              ]
                    )}
                />
            </div>
        </main>
    )
}
