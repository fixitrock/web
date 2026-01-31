'use client'

import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { ScrollShadow } from '@heroui/react'

import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            className={cn('flex w-full flex-col outline-none', className)}
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
                <Command className='**:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3'>
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    )
}

function CommandInput({
    className,
    startContent,
    endContent,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
    startContent?: React.ReactNode
    endContent?: React.ReactNode
}) {
    return (
        <div
            className={cn('flex h-10 w-full items-center p-1.5', className)}
            data-slot='command-input-wrapper'
        >
            <div className='flex flex-1 items-center gap-2'>
                {startContent && <div className='flex items-center'>{startContent}</div>}
                <CommandPrimitive.Input
                    className='placeholder:text-foreground-500 text-medium flex w-full bg-transparent bg-clip-text font-normal outline-hidden placeholder:text-sm disabled:cursor-not-allowed disabled:opacity-50'
                    data-slot='command-input'
                    {...props}
                />
                {endContent && <div className='flex items-center gap-2.5'>{endContent}</div>}
            </div>
        </div>
    )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
    return (
        <ScrollShadow isEnabled className='flex-1 outline-0' size={20}>
            <CommandPrimitive.List
                className={cn('flex flex-col outline-0', className)}
                data-slot='command-list'
                {...props}
            />
        </ScrollShadow>
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

function CommandLoading({ ...props }: React.ComponentProps<typeof CommandPrimitive.Loading>) {
    return <CommandPrimitive.Loading data-slot='command-loading' {...props} />
}
function CommandGroup({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            className={cn(
                'text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:capitalize **:[[cmdk-group-heading]]:select-none',
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

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            className={cn(
                "data-[selected=true]:bg-default/20 data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:backdrop-blur-md [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            data-slot='command-item'
            {...props}
        />
    )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            className={cn('ml-auto space-x-1 text-xs tracking-widest', className)}
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
    CommandLoading,
    CommandShortcut,
    CommandSeparator,
}
