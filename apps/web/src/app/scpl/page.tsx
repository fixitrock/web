'use client'

import Image from 'next/image'
import { Card } from '@heroui-v3/react'
import Link from 'next/link'
import { SiSupabase } from 'react-icons/si'
import { TbDatabaseStar, TbPlugConnectedX } from 'react-icons/tb'

import { formatDateTime } from '@/lib/utils'
import { useSupabse } from '@tanstack/query'
import { Repair } from '@/types/invoice'
import { GridSkeleton } from '@/ui/skeleton'
import { ErrorState } from '@/ui/state'

export default function Page() {
    const { data, isLoading, error } = useSupabse<Repair>('repair')

    return (
        <section className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2'>
            {isLoading ? (
                <GridSkeleton />
            ) : error ? (
                <ErrorState
                    icons={[TbDatabaseStar, SiSupabase, TbPlugConnectedX]}
                    message={error.message}
                    title='Yo, FRP Data is MIA'
                />
            ) : (
                data?.map((f) => (
                    <Card
                        key={f.id}
                        aria-label={f.title}
                        asChild
                        className='w-full rounded-2xl border bg-transparent p-2 shadow-none'
                    >
                        <Link passHref href={f.link} target='_blank'>
                            <Card.Header className='mb-px p-2'>
                                <h1 className='line-clamp-1 text-start text-[13px]'>{f.title}</h1>
                            </Card.Header>
                            <Image
                                width={512}
                                height={512}
                                alt={f.title}
                                className='bg-default/5 dark:bg-default/10 aspect-video h-40 rounded-lg object-contain p-2'
                                src={f.img}
                            />
                            <Card.Footer className='text-muted-foreground justify-end p-2 text-xs'>
                                <p>{formatDateTime(f.created_at)}</p>
                            </Card.Footer>
                        </Link>
                    </Card>
                ))
            )}
        </section>
    )
}
