'use client'
import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@heroui/react'

import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from '@/ui/command'
import { cn } from '@/lib/utils'
import { FilterIcon } from '@/ui/icons'

export function Category({
    categories,
    value,
    onChange,
}: {
    categories?: string[]
    value?: string | null
    onChange?: (val: string | null) => void
}) {
    const [open, setOpen] = React.useState(false)
    const items = ['All Categories', ...(categories ?? [])]

    const currentLabel = value ?? 'Select category'

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    aria-expanded={open}
                    className='bg-background min-w-50 justify-between border'
                    role='combobox'
                    size='sm'
                >
                    <span className='truncate'>{currentLabel}</span>
                    <ChevronDown className='ml-2 h-4 w-4 opacity-60' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-(--radix-popover-trigger-width) overflow-hidden p-0'>
                <Command className='max-h-80'>
                    <CommandInput
                        autoFocus
                        className='border-b'
                        placeholder='Search categories . . .'
                        startContent={<FilterIcon className='size-4' />}
                    />
                    <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                            {items.map((cat) => {
                                const selected = (value ?? 'All Categories') === cat

                                return (
                                    <CommandItem
                                        key={cat}
                                        className='cursor-pointer'
                                        value={cat}
                                        onSelect={(val) => {
                                            setOpen(false)
                                            if (val === 'All Categories') onChange?.(null)
                                            else onChange?.(val)
                                        }}
                                    >
                                        {cat}
                                        <CommandShortcut>
                                            <Check
                                                className={cn(
                                                    'h-4 w-4',
                                                    selected ? 'opacity-100' : 'opacity-0'
                                                )}
                                            />
                                        </CommandShortcut>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
