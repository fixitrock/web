'use client'
import * as React from 'react'
import { ChevronsUpDown, Check } from 'lucide-react'

import { Button } from '@/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/ui/command'
import { cn } from '@/lib/utils'

export function CategoryCombobox({
    categories,
    value,
    onChange,
    placeholder = 'Filter by category',
}: {
    categories: string[]
    value: string | null
    onChange: (val: string | null) => void
    placeholder?: string
}) {
    const [open, setOpen] = React.useState(false)
    const items = ['All', ...categories]

    const currentLabel = value ?? 'All'

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    aria-expanded={open}
                    className='bg-background w-full justify-between'
                    role='combobox'
                    variant='outline'
                >
                    <span className='truncate'>{currentLabel}</span>
                    <ChevronsUpDown className='ml-2 h-4 w-4 opacity-60' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-(--radix-popover-trigger-width) p-0'>
                <Command>
                    <CommandInput placeholder={placeholder} />
                    <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                            {items.map((cat) => {
                                const selected = (value ?? 'All') === cat

                                return (
                                    <CommandItem
                                        key={cat}
                                        className='cursor-pointer'
                                        value={cat}
                                        onSelect={(val) => {
                                            setOpen(false)
                                            if (val === 'All') onChange(null)
                                            else onChange(val)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                selected ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                        {cat}
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
