'use client'

import { useEffect, useState } from 'react'
import { RefreshCcw, CalendarClock, Minimize2, Maximize2, Plus } from 'lucide-react'
import { Button, Tab, Tabs, useDisclosure } from '@heroui/react'
import NumberFlow, { NumberFlowGroup } from '@number-flow/react'
import { usePosTypeStore } from '@/zustand/store'
import { AddProduct } from '../products/add'
// import { ExportStocks } from './export'
import { useMounted } from '@/hooks'

export function PosHeader() {
    const { type, setType } = usePosTypeStore()
    const [isFs, setIsFs] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { mounted } = useMounted()

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
        <header className='flex flex-col items-center justify-between rounded-lg border px-4 py-1 md:flex-row'>
            <div className='hidden items-center gap-2 sm:flex'>
                <CalendarClock aria-hidden='true' className='text-muted-foreground size-5' />
                <DateTimeDisplay />
            </div>
            <div className='flex items-center gap-2'>
                <Tabs
                disableAnimation={!mounted}
                    aria-label='Price Type'
                    classNames={{ cursor: 'bg-default/25 dark:bg-default/30 shadow-none' }}
                    radius='full'
                    selectedKey={type}
                    variant='light'
                    onSelectionChange={(key) => setType(key as 'retail' | 'wholesale')}
                >
                    <Tab key='retail' title='Retail' />
                    <Tab key='wholesale' title='Wholesale' />
                </Tabs>
                <Button
                    isIconOnly
                    aria-label='Refresh products'
                    className='bg-background border md:hidden'
                    size='sm'
                    onPress={() => window.location.reload()}
                    startContent={<RefreshCcw aria-hidden='true' className='size-4' />}
                />
                <Button
                    aria-label='Refresh products'
                    className='bg-background hidden border md:flex'
                    size='sm'
                    onPress={() => window.location.reload()}
                    startContent={<RefreshCcw aria-hidden='true' className='size-4' />}
                >
                    Refresh
                </Button>
                <Button
                    isIconOnly
                    aria-label='Add Product'
                    onPress={onOpen}
                    className='bg-background border md:hidden'
                    size='sm'
                    startContent={<Plus className='size-4' />}
                />
                <Button
                    aria-label='Add Product'
                    onPress={onOpen}
                    className='bg-background hidden border md:flex'
                    size='sm'
                    startContent={<Plus className='size-4' />}
                >
                    Add Product
                </Button>
                {/* <ExportStocks /> */}
                <AddProduct mode='add' isOpen={isOpen} onClose={onClose} />
                <Button
                    isIconOnly
                    aria-label='Enter fullscreen'
                    className='bg-background border'
                    size='sm'
                    startContent={
                        isFs ? (
                            <Minimize2 aria-hidden='true' className='size-4' />
                        ) : (
                            <Maximize2 aria-hidden='true' className='size-4' />
                        )
                    }
                    onPress={onToggleFullscreen}
                />
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
