'use client'

import { Button, Input as Drive, InputProps as Props } from '@heroui/react'
import { Loader, Search, Undo2 } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

type InputProps = {
    value?: string
    hotKey?: string
    base?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    end?: React.ReactNode
    href?: string
} & Props

export function Input({ value = '', hotKey, end, href, onChange, ...inputProps }: InputProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (value) {
            setIsLoading(true)
            const timer = setTimeout(() => {
                setIsLoading(false)
            }, 300)

            return () => clearTimeout(timer)
        }
        setIsLoading(false)
    }, [value])

    useHotkeys(
        hotKey || '',
        (event) => {
            if (hotKey) {
                event.preventDefault()
                inputRef.current?.focus()
            }
        },
        [hotKey]
    )

    return (
        <Drive
            ref={inputRef}
            fullWidth
            className='bg-transparent'
            classNames={{
                inputWrapper:
                    'rounded-sm border bg-transparent shadow-none group-data-[focus=true]:bg-transparent data-[hover=true]:bg-transparent',

                input: 'truncate overflow-hidden',
            }}
            endContent={
                <>
                    {!value && hotKey && (
                        <Button
                            isIconOnly
                            className='bg-default/20 dark:bg-default/40 hidden h-5 w-5 min-w-5! rounded border text-[12px] sm:block'
                            radius='none'
                            size='sm'
                            variant='light'
                        >
                            {hotKey.toUpperCase()}
                        </Button>
                    )}

                    <div className='ml-0.5 flex items-center gap-0.5'>{end}</div>
                </>
            }
            size='sm'
            startContent={
                <>
                    {isLoading ? (
                        <Loader className='text-muted-foreground h-4 w-4 shrink-0 animate-spin' />
                    ) : (
                        <>
                            {href ? (
                                <>
                                    <Button
                                        as={Link}
                                        className='h-8 w-12 min-w-0 p-0 sm:hidden'
                                        href={href}
                                        radius='full'
                                        size='sm'
                                        variant='light'
                                    >
                                        <Undo2 size={18} />
                                    </Button>
                                    <Search className='hidden h-4 w-4 shrink-0 sm:block' />
                                </>
                            ) : (
                                <Search className='h-4 w-4 shrink-0' />
                            )}
                        </>
                    )}
                </>
            }
            type='search'
            value={value}
            onChange={onChange}
            {...inputProps}
        />
    )
}
