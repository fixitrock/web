'use client'

import NumberFlow, { NumberFlowGroup } from '@number-flow/react'
import {
    CalendarClock,
    Maximize2,
    Minimize2,
    Plus,
    RefreshCcw,
    ShoppingCart,
} from 'lucide-react'
import { Button, Tabs } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { usePathname, useRouter } from 'next/navigation'

import { useCartStore, usePosTypeStore } from '@/zustand/store'
import { useProductStore } from '@/zustand/store/product'

export function PosHeader() {
    const { type, setType } = usePosTypeStore()
    const [isFs, setIsFs] = useState(false)
    const { setMode } = useProductStore()
    const { showCart, setShowCart, getTotalItems } = useCartStore()
    const router = useRouter()
    const pathname = usePathname()

    const openAddProduct = () => {
        setMode('add')
        router.push(`${pathname}/new`)
    }

    useHotkeys(
        'a',
        (event) => {
            event.preventDefault()
            openAddProduct()
        },
        [openAddProduct]
    )

    useEffect(() => {
        const onChange = () => setIsFs(Boolean(document.fullscreenElement))

        document.addEventListener('fullscreenchange', onChange)

        return () => document.removeEventListener('fullscreenchange', onChange)
    }, [])

    const onToggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen()
        } else {
            await document.exitFullscreen()
        }
    }

    return (
        <header className='flex flex-col items-center justify-between rounded-2xl border px-4 py-1 md:flex-row'>
            <div className='hidden items-center gap-2 sm:flex'>
                <CalendarClock aria-hidden='true' className='text-muted-foreground size-5' />
                <DateTimeDisplay />
            </div>
            <div className='flex items-center gap-2'>
                <Tabs
                    aria-label='Price Type'
                    selectedKey={type}
                    variant='secondary'
                    onSelectionChange={(key) => setType(key as 'retail' | 'wholesale')}
                >
                    <Tabs.ListContainer>
                        <Tabs.List aria-label='Price Type' className='bg-default/15'>
                            <Tabs.Tab id='retail'>
                                Retail
                                <Tabs.Indicator className='w-full' />
                            </Tabs.Tab>
                            <Tabs.Tab id='wholesale'>
                                Wholesale
                                <Tabs.Indicator className='w-full' />
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                </Tabs>
                <Button
                    isIconOnly
                    aria-label='Refresh products'
                    className='bg-background border md:hidden'
                    size='sm'
                    onPress={() => window.location.reload()}
                >
                    <RefreshCcw aria-hidden='true' className='size-4' />
                </Button>
                <Button
                    aria-label='Refresh products'
                    className='bg-background hidden border md:flex'
                    size='sm'
                    onPress={() => window.location.reload()}
                >
                    <RefreshCcw aria-hidden='true' className='mr-2 size-4' />
                    Refresh
                </Button>
                <Button
                    isIconOnly
                    aria-label='Add Product'
                    className='bg-background border md:hidden'
                    size='sm'
                    onPress={openAddProduct}
                >
                    <Plus className='size-4' />
                </Button>
                <Button
                    aria-label='Add Product'
                    className='bg-background hidden border md:flex'
                    size='sm'
                    onPress={openAddProduct}
                >
                    <Plus className='mr-2 size-4' />
                    Add Product
                </Button>
                <Button
                    isIconOnly
                    aria-label='Toggle cart'
                    className='bg-background border md:hidden'
                    size='sm'
                    onPress={() => setShowCart(!showCart)}
                >
                    <ShoppingCart className='size-4' />
                </Button>
                <Button
                    aria-label='Toggle cart'
                    className='bg-background hidden border md:flex'
                    size='sm'
                    onPress={() => setShowCart(!showCart)}
                >
                    <ShoppingCart className='mr-2 size-4' />
                    Cart {getTotalItems()}
                </Button>
                <Button
                    isIconOnly
                    aria-label='Enter fullscreen'
                    className='bg-background border'
                    size='sm'
                    onPress={onToggleFullscreen}
                >
                    {isFs ? (
                        <Minimize2 aria-hidden='true' className='size-4' />
                    ) : (
                        <Maximize2 aria-hidden='true' className='size-4' />
                    )}
                </Button>
            </div>
        </header>
    )
}

function DateTimeDisplay() {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000)

        return () => clearInterval(interval)
    }, [])

    const dayName = now.toLocaleDateString('en-US', { weekday: 'short' })
    const monthName = now.toLocaleDateString('en-US', { month: 'short' })
    const dateNum = now.getDate()

    let hours = now.getHours()
    const minutes = now.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'

    hours = hours % 12
    if (hours === 0) hours = 12

    return (
        <NumberFlowGroup>
            <div className='flex items-baseline space-x-1 text-lg font-semibold'>
                <span>{dayName},</span>
                <span>{monthName}</span>
                <span>{dateNum},</span>
                <NumberFlow format={{ minimumIntegerDigits: 2 }} trend={0} value={hours} />
                <NumberFlow
                    format={{ minimumIntegerDigits: 2 }}
                    prefix=':'
                    trend={0}
                    value={minutes}
                />
                <span className='ml-1'>{ampm}</span>
            </div>
        </NumberFlowGroup>
    )
}
