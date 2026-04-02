'use client'

import { Button, InputGroup } from '@heroui/react'
import { Search, Undo2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

type InputProps = {
    value?: string
    hotKey?: string
    end?: React.ReactNode
    href?: string
    placeholder?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    onInput?: React.FormEventHandler<HTMLInputElement>
    disabled?: boolean
}

export function Input({
    value = '',
    hotKey,
    end,
    href,
    placeholder,
    onChange,
    onInput,
    disabled,
}: InputProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const router = useRouter()

    const focusInput = React.useCallback(() => {
        inputRef.current?.focus()
    }, [])

    const clearValue = React.useCallback(() => {
        const input = inputRef.current

        if (!input || disabled || !value) return

        const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
        )?.set

        nativeSetter?.call(input, '')
        input.dispatchEvent(new Event('input', { bubbles: true }))
        focusInput()
    }, [disabled, focusInput, value])

    useHotkeys(
        hotKey ?? '',
        (event) => {
            event.preventDefault()
            focusInput()
        },
        {
            enabled: Boolean(hotKey) && !disabled,
            enableOnFormTags: false,
            preventDefault: true,
        },
        [focusInput, hotKey, disabled]
    )

    return (
        <InputGroup className='border-border flex w-full shrink-0 items-center border bg-transparent shadow-none sm:w-fit'>
            <InputGroup.Prefix>
                {href ? (
                    <>
                        <Button
                            isIconOnly
                            aria-label='Go back'
                            className='size-7 sm:hidden'
                            isDisabled={disabled}
                            size='sm'
                            variant='ghost'
                            onPress={() => router.push(href)}
                        >
                            <Undo2 aria-hidden='true' className='size-4' />
                        </Button>
                        <Search
                            aria-hidden='true'
                            className='text-muted-foreground hidden size-4 shrink-0 sm:block'
                        />
                    </>
                ) : (
                    <Search aria-hidden='true' className='text-muted-foreground size-4 shrink-0' />
                )}
            </InputGroup.Prefix>

            <InputGroup.Input
                ref={inputRef}
                disabled={disabled}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onInput={onInput}
            />

            <InputGroup.Suffix>
                {value ? (
                    <Button
                        isIconOnly
                        aria-label='Clear search'
                        className='size-5'
                        isDisabled={disabled}
                        size='sm'
                        variant='ghost'
                        onPress={clearValue}
                    >
                        <X aria-hidden='true' className='size-4' />
                    </Button>
                ) : (
                    hotKey && (
                        <Button
                            isIconOnly
                            aria-label={`Shortcut ${hotKey.toUpperCase()}`}
                            className='bg-default/20 dark:bg-default/40 hidden size-5 rounded border sm:block'
                            isDisabled={disabled}
                            size='sm'
                            variant='ghost'
                            onPress={focusInput}
                        >
                            {hotKey.toUpperCase()}
                        </Button>
                    )
                )}

                {end && <div className='flex items-center gap-0.5'>{end}</div>}
            </InputGroup.Suffix>
        </InputGroup>
    )
}
