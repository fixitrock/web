'use client'
import type { Navigation as NavigationItem } from '@/app/login/types'

import { Header, Label, ListBox } from '@heroui/react'
import * as Icons from 'lucide-react'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'

type NavLinksProps = {
    navigation: NavigationItem[]
    onClose?: () => void
}

export function Navigation({ navigation, onClose }: NavLinksProps) {
    const pathname = usePathname()
    const router = useRouter()

    const handleAction = (key: React.Key) => {
        if (onClose) onClose()
        router.push(String(key))
    }

    return (
        <ListBox
            aria-label='Navigation'
            className='w-full'
            selectedKeys={new Set([pathname])}
            selectionMode='single'
            onAction={handleAction}
        >
            <ListBox.Section>
                <Header className='sr-only'>Navigation</Header>
                {navigation.map((item) => {
                    const iconName = item.icon.charAt(0).toUpperCase() + item.icon.slice(1)
                    const LucideIcon = Icons[iconName as keyof typeof Icons] as
                        | React.ElementType
                        | undefined

                    return (
                        <ListBox.Item
                            key={item.href}
                            id={item.href}
                            className='data-[focused=true]:bg-muted/50 data-[hovered=true]:bg-muted/50'
                            textValue={item.title}
                        >
                            {LucideIcon ? (
                                <LucideIcon className='text-muted-foreground mx-auto' size={18} />
                            ) : null}
                            <Label>{item.title}</Label>
                        </ListBox.Item>
                    )
                })}
            </ListBox.Section>
        </ListBox>
    )
}
