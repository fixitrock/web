'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@heroui/react'
import { ChevronLeft } from 'lucide-react'

import { Input, SortBy, SwitchLayout } from '@/app/(space)/ui'
import { SortField, SortOrder } from '@/types/drive'

import { formatTitle } from '../utils'
import StickyTop from '@/ui/farmer/sticky'

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
        <StickyTop>
            <div className='hidden flex-1 items-center gap-1.5 select-none sm:flex'>
                <Button isIconOnly size='sm' variant='ghost' onPress={() => router.push(backHref)}>
                    <ChevronLeft size={20} />
                </Button>
                <h1 className='truncate text-base font-bold sm:text-lg'>
                    {formatTitle(lastSegment)}
                </h1>
            </div>
            <Input
                end={
                    <>
                        <SwitchLayout />
                        <span className='text-muted-foreground text-xs'>|</span>
                        <SortBy sort={handleSort} />
                    </>
                }
                hotKey='F'
                href={backHref}
                placeholder={`Search in ${formatTitle(lastSegment)} . . .`}
                value={query}
                onInput={(e) => handleQueryChange(e.currentTarget.value)}
            />
        </StickyTop>
    )
}
