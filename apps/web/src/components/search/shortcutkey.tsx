'use client'

import { Button, Tooltip } from '@heroui/react'
import { ArrowDown, ArrowRightToLine, ArrowUp, CornerDownLeft } from 'lucide-react'
import React from 'react'

type Icon = {
    tooltip: string
    icon: React.ReactNode
}

type ShortcutProps = {
    tooltip: string
    icon: React.ReactNode
}

const Shortcut: React.FC<ShortcutProps> = ({ tooltip, icon }) => (
    <Tooltip>
        <Tooltip.Trigger>
            <Button
                isIconOnly
                aria-label={tooltip}
                className='bg-default/10 dark:bg-default/30 h-6 w-6 min-w-0 rounded-sm border'
                size='sm'
                variant='ghost'
            >
                {icon}
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content showArrow>
            <Tooltip.Arrow />
            <p>{tooltip}</p>
        </Tooltip.Content>
    </Tooltip>
)

const icons: Icon[] = [
    { tooltip: 'Tab -> Next List', icon: <ArrowRightToLine size={16} /> },
    { tooltip: 'Up -> Move Up', icon: <ArrowUp size={16} /> },
    { tooltip: 'Down -> Move Down', icon: <ArrowDown size={16} /> },
    { tooltip: 'Enter -> Open Item', icon: <CornerDownLeft size={16} /> },
]

export default function ShortcutKey() {
    return (
        <div className='flex select-none items-center gap-2'>
            <h3 className='text-muted-foreground text-sm'>Shortcut Key</h3>
            <div className='flex gap-2'>
                {icons.map(({ tooltip, icon }, index) => (
                    <Shortcut key={index} icon={icon} tooltip={tooltip} />
                ))}
            </div>
        </div>
    )
}
