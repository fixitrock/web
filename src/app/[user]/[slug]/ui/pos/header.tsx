'use client'

import { useEffect, useState } from 'react'

import { CalendarIcon, ClockIcon } from '@/ui/icons'

export function Header() {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date()

            // Format date as DD/MM/YYYY
            const formattedDate = now.toLocaleDateString('en-GB')

            // Format time as hh:mmam / pm
            const formattedTime = now
                .toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                })
                .toLowerCase()

            setDate(formattedDate)
            setTime(formattedTime)
        }

        updateDateTime() // run immediately
        const timer = setInterval(updateDateTime, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className='flex items-center gap-2 select-none'>
            <div
                className='flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium'
                data-slot='Pos Date'
            >
                <CalendarIcon className='size-5' />
                {date}
            </div>
            -
            <div
                className='flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium'
                data-slot='Pos Time'
            >
                <ClockIcon className='size-5' />
                {time}
            </div>
        </div>
    )
}
