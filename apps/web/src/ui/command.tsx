'use client'

import * as React from 'react'
import { Command as CommandPrimitive, useCommandState } from 'cmdk'
import { ScrollShadow } from '@heroui/react'

import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'
import { LayoutGroup, motion } from 'framer-motion'

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
    startContent?: React.ReactNode
    endContent?: React.ReactNode
}
type CommandListProps = Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>, 'key'>
type CommandEmptyProps = Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>, 'key'>
type CommandLoadingProps = Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Loading>,
    'key'
>
type CommandGroupProps = Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>, 'key'>
type CommandSeparatorProps = Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>,
    'key'
>
type CommandItemProps = Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>, 'key'>

const Command = React.forwardRef<HTMLDivElement, CommandProps>(function Command(
    { className, ...props },
    ref
) {
    return (
        <CommandPrimitive
            ref={ref}
            className={cn('flex w-full flex-col outline-none', className)}
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
                <Command className='**:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3'>
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    )
}

const CommandInput: React.ForwardRefExoticComponent<
    CommandInputProps & React.RefAttributes<HTMLInputElement>
> = React.forwardRef<HTMLInputElement, CommandInputProps>(function CommandInput(
    { className, startContent, endContent, ...props },
    ref
) {
    return (
        <div
            className={cn('flex w-full items-center px-2 py-1', className)}
            data-slot='command-input-wrapper'
        >
            <div className='flex flex-1 items-center gap-2'>
                {startContent && <div className='flex items-center'>{startContent}</div>}
                <CommandPrimitive.Input
                    ref={ref}
                    className='placeholder:text-foreground-500 text-medium flex w-full bg-transparent bg-clip-text font-normal outline-hidden placeholder:text-sm disabled:cursor-not-allowed disabled:opacity-50'
                    data-slot='command-input'
                    {...props}
                />
                {endContent && <div className='flex items-center gap-2.5'>{endContent}</div>}
            </div>
        </div>
    )
})

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(function CommandList(
    { className, ...props },
    ref
) {
    return (
        <ScrollShadow isEnabled className='flex-1 outline-0' size={20}>
            <LayoutGroup id='command'>
                <CommandPrimitive.List
                    ref={ref}
                    className={cn('flex flex-col outline-0', className)}
                    data-slot='command-list'
                    {...props}
                />
            </LayoutGroup>
        </ScrollShadow>
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

const CommandLoading = React.forwardRef<HTMLDivElement, CommandLoadingProps>(
    function CommandLoading({ ...props }, ref) {
        return <CommandPrimitive.Loading ref={ref} data-slot='command-loading' {...props} />
    }
)

CommandLoading.displayName = CommandPrimitive.Loading.displayName

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(function CommandGroup(
    { className, ...props },
    ref
) {
    return (
        <CommandPrimitive.Group
            ref={ref}
            className={cn(
                'text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:capitalize **:[[cmdk-group-heading]]:select-none',
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

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
    ({ className, children, value, ...props }, ref) => {
        const selectedValue = useCommandState((state) => state.value)
        const selected = selectedValue === value

        return (
            <CommandPrimitive.Item
                data-slot='command-item'
                ref={ref}
                value={value}
                className={cn(
                    'relative flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm outline-none',
                    'data-[disabled=true]:opacity-50',
                    className
                )}
                {...props}
            >
                {selected && (
                    <motion.div
                        layoutId='command-highlight'
                        layout
                        transition={{
                            type: 'spring',
                            stiffness: 600,
                            damping: 45,
                            mass: 0.8,
                        }}
                        className='bg-default/20 pointer-events-none absolute inset-0 rounded-md backdrop-blur-md'
                    />
                )}

                <div className='relative z-10 flex w-full items-center gap-2'>{children}</div>
            </CommandPrimitive.Item>
        )
    }
)

CommandItem.displayName = CommandPrimitive.Item.displayName

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
