'use client'
import { RiArrowRightUpLine } from 'react-icons/ri'

interface StatsCardProps {
    title: string
    value: string
    color?: string
}

export const StatsCard = ({ title, value, color }: StatsCardProps) => {
    return (
        <div className='group before:from-input/30 before:via-input before:to-input/30 relative p-4 before:absolute before:inset-y-8 before:right-0 before:w-px before:bg-gradient-to-b last:before:hidden lg:p-5'>
            <div className='relative flex items-center gap-4'>
                <RiArrowRightUpLine
                    aria-hidden='true'
                    className='absolute top-0 right-0 text-emerald-500 opacity-0 transition-opacity group-has-[a:hover]:opacity-100'
                    size={20}
                />

                <div>
                    <p className='text-muted-foreground/60 text-xs font-medium tracking-widest uppercase before:absolute before:inset-0'>
                        {title}
                    </p>
                    <div className={`mb-2 text-2xl font-semibold ${color}`}>{value}</div>
                </div>
            </div>
        </div>
    )
}
