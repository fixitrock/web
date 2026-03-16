'use client'

import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'

type CommandProps = Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive>, 'key'>
type CommandDialogProps = Omit<
    React.ComponentPropsWithoutRef<typeof Dialog>,
    'children' | 'key'
> & {
    title?: string
    description?: string
    className?: string
    showCloseButton?: boolean
    children?: React.ReactNode
}
type CommandInputProps = Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    'key'
> & {
    classNames?: {
        base?: string
        input?: string
    }
    endContent?: React.ReactNode
    startContent?: React.ReactNode
}
type CommandListProps = Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>, 'key'>
type CommandEmptyProps = Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>, 'key'>
type CommandGroupProps = Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>, 'key'>
type CommandSeparatorProps = Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>,
    'key'
>
type CommandItemProps = Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>,
    'key'
> & {
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
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(function Command(
    { className, ...props },
    ref
) {
    return (
        <CommandPrimitive
            ref={ref}
            className={cn(
                'bg-background flex h-auto w-full flex-col overflow-hidden rounded-md',
                className
            )}
            data-slot='command'
            {...props}
        />
    )
})

Command.displayName = CommandPrimitive.displayName

function CommandDialog({
    title = 'Command Palette',
    description = 'Search for a command to run...',
    children,
    className,
    showCloseButton = true,
    ...props
}: CommandDialogProps) {
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
                <Command className='**:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-22 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3'>
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    )
}

const CommandInput: React.ForwardRefExoticComponent<
    CommandInputProps & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, CommandInputProps>(function CommandInput(
    { classNames, endContent, startContent, ...props },
    ref
) {
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
                    ref={ref}
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
})

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(function CommandList(
    { className, ...props },
    ref
) {
    return (
        <CommandPrimitive.List
            ref={ref}
            className={cn(
                'flex flex-1 flex-col overflow-x-hidden overflow-y-auto outline-0',
                className
            )}
            data-slot='command-list'
            {...props}
        />
    )
})

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(function CommandEmpty(
    { ...props },
    ref
) {
    return (
        <CommandPrimitive.Empty
            ref={ref}
            className='py-6 text-center text-sm'
            data-slot='command-empty'
            {...props}
        />
    )
})

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(function CommandGroup(
    { className, ...props },
    ref
) {
    return (
        <CommandPrimitive.Group
            ref={ref}
            className={cn(
                'text-foreground **:[[cmdk-group-heading]]:text-muted-foreground flex flex-col overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:select-none',
                className
            )}
            data-slot='command-group'
            {...props}
        />
    )
})

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
    function CommandSeparator({ className, ...props }, ref) {
        return (
            <CommandPrimitive.Separator
                ref={ref}
                className={cn('bg-border h-px', className)}
                data-slot='command-separator'
                {...props}
            />
        )
    }
)

CommandSeparator.displayName = CommandPrimitive.Separator.displayName

function CommandItem({
    startContent,
    endContent,
    title,
    description,
    classNames,
    href,
    ...props
}: CommandItemProps) {
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
