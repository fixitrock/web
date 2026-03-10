'use client'
import type { Navigation } from '@/app/login/types'

import { Listbox, ListboxItem } from '@heroui/react'
import React from 'react'
import * as Icons from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavLinksProps = {
    navigation: Navigation[]
    onClose?: () => void
}

export function Navigation({ navigation, onClose }: NavLinksProps) {
    const pathname = usePathname()
    const handleClick = () => {
        if (onClose) onClose()
    }

    return (
        <Listbox
            aria-label='Navigation'
            className='w-full'
            items={navigation}
            selectedKeys={pathname}
            variant='flat'
        >
            {navigation.map((n) => {
                const iconName = n.icon.charAt(0).toUpperCase() + n.icon.slice(1)
                const LucideIcon = Icons[iconName as keyof typeof Icons] as
                    | React.ElementType
                    | undefined

                return (
                    <ListboxItem
                        key={n.href}
                        as={Link}
                        className='data-[hover=true]:bg-muted/50'
                        href={n.href}
                        startContent={
                            LucideIcon ? (
                                <LucideIcon className='text-muted-foreground mx-auto' size={18} />
                            ) : null
                        }
                        onPress={handleClick}
                    >
                        {n.title}
                    </ListboxItem>
                )
            })}
        </Listbox>
    )
}
