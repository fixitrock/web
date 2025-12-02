'use client'

import { ChevronRight } from 'lucide-react'
import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { Button } from '@heroui/react'

import { cn } from '@/lib/utils'

function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
    return <DrawerPrimitive.Root data-slot='drawer' {...props} />
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
    return <DrawerPrimitive.Trigger data-slot='drawer-trigger' {...props} />
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
    return <DrawerPrimitive.Portal data-slot='drawer-portal' {...props} />
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
    return <DrawerPrimitive.Close data-slot='drawer-close' {...props} />
}

function DrawerOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
    return (
        <DrawerPrimitive.Overlay
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-[1px]',
                className
            )}
            data-slot='drawer-overlay'
            {...props}
        />
    )
}

function DrawerContent({
    className,
    children,
    showbar = true,
    hideCloseButton = false,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
    showbar?: boolean
    hideCloseButton?: boolean
}) {
    return (
        <DrawerPortal data-slot='drawer-portal'>
            <DrawerOverlay />
            <DrawerPrimitive.Content
                className={cn(
                    'group/drawer-content bg-background/80 fixed z-50 flex h-auto flex-col backdrop-blur focus:outline-none',
                    // Top Drawer
                    'data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b',
                    // Bottom Drawer
                    'data-[vaul-drawer-direction=bottom]:min-h-fit data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=bottom]:border-x md:min-h-auto',
                    // Right Drawer
                    'data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-3xl data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-xs',
                    // Left Drawer
                    'data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm',
                    className
                )}
                data-slot='drawer-content'
                {...props}
            >
                {showbar && <div className='bg-default mx-auto my-2 h-1 w-20 rounded-full ' />}
                {hideCloseButton && (
                    <DrawerPrimitive.Close
                        asChild
                        className='absolute top-4 right-0.5'
                        data-slot='drawer-close'
                    >
                        <Button
                            isIconOnly
                            aria-label='Close drawer'
                            radius='full'
                            size='sm'
                            startContent={<ChevronRight />}
                            variant='light'
                        />
                    </DrawerPrimitive.Close>
                )}

                <div className={cn('flex h-full flex-col')}>{children}</div>
            </DrawerPrimitive.Content>
        </DrawerPortal>
    )
}

// Nested Drawer Components
function DrawerNested({ ...props }: React.ComponentProps<typeof DrawerPrimitive.NestedRoot>) {
    return <DrawerPrimitive.NestedRoot data-slot='drawer-nested-root' {...props} />
}

function DrawerBody({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('flex-1 overflow-y-auto p-4', className)}
            data-slot='drawer-body'
            {...props}
        />
    )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div className={cn('flex flex-col p-4', className)} data-slot='drawer-header' {...props} />
    )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn('mt-auto flex flex-col gap-2 p-4', className)}
            data-slot='drawer-footer'
            {...props}
        />
    )
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
    return (
        <DrawerPrimitive.Title
            className={cn('text-foreground font-semibold', className)}
            data-slot='drawer-title'
            {...props}
        />
    )
}

function DrawerDescription({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
    return (
        <DrawerPrimitive.Description
            className={cn('text-muted-foreground text-sm', className)}
            data-slot='drawer-description'
            {...props}
        />
    )
}

export {
    Drawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerNested,
    DrawerBody,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
}
