'use client'

import { Button } from '@heroui/react'
import Link from 'next/link'
import { useRouter } from 'nextjs-toploader/app'

import { cn } from '@/lib/utils'

type TitleActionProps = {
    title: string
    children: React.ReactNode
    href: string
    className?: string
}

export const TitleAction = ({ title, children, href, className }: TitleActionProps) => {
    const router = useRouter()

    return (
        <section className='flex flex-col space-y-2'>
            <div className='flex items-center justify-between px-1'>
                <h1 className='my-2 text-left text-lg font-bold sm:text-xl'>{title}</h1>
                <Button
                    passHref
                    as={Link}
                    className='bg-default/30 data-[hover=true]:bg-muted/50 rounded-lg backdrop-blur'
                    href={href}
                    size='sm'
                    onPress={() => router.push(href)}
                >
                    View All
                </Button>
            </div>
            <div className={cn(className)}>{children}</div>
        </section>
    )
}
