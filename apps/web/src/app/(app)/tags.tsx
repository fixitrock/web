'use client'
import type { Navigation } from '../login/types'
import type { SVGProps } from 'react'

import { Button } from '@heroui/react'
import * as Icons from 'lucide-react'
import { useRouter } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { Eva } from '@/ui/eva'

export function Tags({ navigation = [] }: { navigation?: Navigation[] }) {
    const router = useRouter()
    const suggestion = siteConfig.suggestion.filter((s) => s.title !== 'Home')
    const navigationWithIcons = navigation.map((nav) => {
        let iconComp: React.ElementType<SVGProps<SVGSVGElement>> | undefined

        if (nav.icon && nav.icon in Icons) {
            iconComp = Icons[nav.icon as keyof typeof Icons] as React.ElementType<
                SVGProps<SVGSVGElement>
            >
        }

        return {
            ...nav,
            icon: iconComp,
        }
    })
    const allTags = [...navigationWithIcons, ...suggestion]

    return (
        <div>
            <Eva placeholder='Work in progress . . .' />

            <div className='mt-4 flex w-full flex-row flex-wrap items-center justify-center gap-x-3 gap-y-2'>
                {allTags.map((s) => {
                    const Icon = s.icon as React.ElementType<SVGProps<SVGSVGElement>> | undefined

                    return (
                        <Button
                            key={s.href}
                            aria-label={s.title}
                            className='h-8 rounded-full border'
                            variant='ghost'
                            onPress={() => router.push(s.href)}
                        >
                            {Icon ? (
                                <Icon className='text-muted-foreground mx-auto size-4' />
                            ) : null}
                            {s.title}
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}
