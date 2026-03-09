'use client'

import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            className={cn(
                'bg-background flex h-auto w-full flex-col overflow-hidden rounded-md',
                className
            )}
            data-slot='command'
            {...props}
        />
    )
}

function CommandDialog({
    title = 'Command Palette',
    description = 'Search for a command to run...',
    children,
    className,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof Dialog> & {
    title?: string
    description?: string
    className?: string
    showCloseButton?: boolean
}) {
    return (
        <Dialog {...props}>
            <DialogHeader className='sr-only'>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogContent
                className={cn('overflow-hidden p-0', className)}
                showCloseButton={showCloseButton}
            >
                <Command className='[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5'>
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    )
}

function CommandInput({
    classNames,
    endContent,
    startContent,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
    classNames?: {
        base?: string
        input?: string
    }
    endContent?: React.ReactNode
    startContent?: React.ReactNode
}) {
    return (
        <div
            className={cn(
                'bg-background/80 data-[hover=true]:bg-background/80 group-data-[focus=true]:bg-background/80 flex h-10 items-center px-1.5 backdrop-blur',
                classNames?.base
            )}
            data-slot='command-input-wrapper'
        >
            <div className='flex flex-1 items-center gap-2'>
                {startContent && <div className='flex items-center'>{startContent}</div>}
                <CommandPrimitive.Input
                    className={cn(
                        'placeholder:text-foreground-500 text-medium flex w-full bg-transparent bg-clip-text font-normal outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
                        classNames?.input
                    )}
                    data-slot='command-input'
                    {...props}
                />
            </div>
            {endContent && <div className='flex items-center gap-2.5'>{endContent}</div>}
        </div>
    )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
    return (
        <CommandPrimitive.List
            className={cn(
                'flex flex-1 flex-col overflow-x-hidden overflow-y-auto outline-0',
                className
            )}
            data-slot='command-list'
            {...props}
        />
    )
}

function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            className='py-6 text-center text-sm'
            data-slot='command-empty'
            {...props}
        />
    )
}

function CommandGroup({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            className={cn(
                'text-foreground [&_[cmdk-group-heading]]:text-muted-foreground flex flex-col overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:select-none',
                className
            )}
            data-slot='command-group'
            {...props}
        />
    )
}

function CommandSeparator({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            className={cn('bg-border h-px', className)}
            data-slot='command-separator'
            {...props}
        />
    )
}

function CommandItem({
    startContent,
    endContent,
    title,
    description,
    classNames,
    href,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Item> & {
    startContent?: React.ReactNode
    endContent?: React.ReactNode
    title?: string
    href?: string
    description?: string
    classNames?: {
        base?: string
        title?: string
        description?: string
        startContent?: string
        endContent?: string
    }
}) {
    const Content = (
        <CommandPrimitive.Item
            className={cn(
                "data-[selected=true]:bg-default/20 dark:data-[selected=true]:bg-default/20 data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                classNames?.base
            )}
            data-slot='command-item'
            {...props}
        >
            {startContent && (
                <div
                    className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border',
                        classNames?.startContent
                    )}
                >
                    {startContent}
                </div>
            )}
            <div className='flex w-full flex-1 flex-col items-start truncate'>
                {title && (
                    <div className={cn('text-sm font-medium', classNames?.title)}>{title}</div>
                )}
                {description && (
                    <div className={cn('text-muted-foreground text-xs', classNames?.description)}>
                        {description}
                    </div>
                )}
            </div>
            {endContent && (
                <div className={cn('flex items-center', classNames?.endContent)}>{endContent}</div>
            )}
        </CommandPrimitive.Item>
    )

    if (href) {
        return (
            <Link passHref className='block' href={href}>
                {Content}
            </Link>
        )
    }

    return Content
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
            data-slot='command-shortcut'
            {...props}
        />
    )
}

export {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
}
