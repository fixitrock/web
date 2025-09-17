'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Link, Navbar as Header } from '@heroui/react'
import { ChevronLeft } from 'lucide-react'

import { Input, SortBy, SwitchLayout } from '@/app/(space)/ui'
import { cn } from '@/lib/utils'
import { SortField, SortOrder } from '@/types/drive'

import { formatTitle } from '../utils'

interface NavbarProps {
    title?: string
    initialQuery?: string
    initialSortField?: SortField
    initialSortOrder?: SortOrder
    className?: string
}

export function Navbar({
    title,
    initialQuery = '',
    initialSortField,
    initialSortOrder,
    className,
}: NavbarProps) {
    const router = useRouter()

    const [query, setQuery] = useState(initialQuery)
    const [sortField, setSortField] = useState<SortField | undefined>(initialSortField)
    const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(initialSortOrder)

    const updateURL = useCallback(
        (nextQuery?: string, nextSortField?: SortField, nextSortOrder?: SortOrder) => {
            const search = new URLSearchParams()

            if (nextQuery) search.set('s', nextQuery)
            if (nextSortField) {
                search.set('sort', nextSortField)
                search.set('order', nextSortOrder ?? 'asc')
            }

            router.replace(`?${search.toString()}`)
        },
        [router]
    )

    const handleSort = (field: SortField, order: SortOrder) => {
        setSortField(field)
        setSortOrder(order)
        updateURL(query, field, order)
    }

    const handleQueryChange = (value: string) => {
        setQuery(value)
        updateURL(value, sortField, sortOrder)
    }

    const backHref = `/space/${title?.split('/').slice(0, -1).join('/')}`
    const lastSegment = title?.split('/').pop()

    return (
        <Header
            shouldHideOnScroll
            className={cn('', className)}
            classNames={{
                wrapper: 'h-auto p-0 py-2',
            }}
            maxWidth='full'
        >
            <div className='hidden h-10 items-center gap-1.5 select-none sm:flex'>
                <Button
                    as={Link}
                    className='h-8 w-8 min-w-0 p-0'
                    href={backHref}
                    radius='full'
                    size='sm'
                    variant='light'
                >
                    <ChevronLeft size={20} />
                </Button>
                <h1 className='truncate text-base font-bold sm:text-lg'>
                    {formatTitle(lastSegment)}
                </h1>
            </div>

            <Input
                end={
                    <div className='ml-0.5 flex items-center gap-0.5'>
                        <SwitchLayout />
                        <span className='text-muted-foreground text-xs'>|</span>
                        <SortBy sort={handleSort} />
                    </div>
                }
                hotKey='F'
                href={backHref}
                placeholder={`Search in ${formatTitle(lastSegment)} . . .`}
                value={query}
                onInput={(e) => handleQueryChange(e.currentTarget.value)}
            />
        </Header>
    )
}
