'use client'

import type { SortField, SortOrder, Drive } from '@/types/drive'

import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

import { getDriveItems } from '@/app/(space)/utils'
import { List, Grid, EmptyState, ErrorState } from '@/app/(space)/ui'
import { useDriveStore, useLayout } from '@/zustand/store'
import { useDriveData } from '@/hooks/useDriveData'

interface Props {
    space: string
    layout: 'grid' | 'list'
    query: string
    sortField?: SortField
    sortOrder?: SortOrder
    initial: Drive & { nextPage?: string }
    userRole?: number
}

export function Data({
    space,
    layout: view,
    query,
    sortField,
    sortOrder,
    initial,
    userRole,
}: Props) {
    const { initialize } = useDriveStore()
    const {
        setLayout,
        layout,
        initializeFromCookie,
        initializeGlobalSync,
        syncFromURL,
        syncFromLocalStorage,
        subscribeToLocalStorage,
    } = useLayout()
    const {
        children,
        loadingMore,
        error,
        hasMore,
        totalLoaded,
        ref,
        isEmpty,
        isNotFound,
        isError,
        loadMore,
    } = useDriveData({ space })

    useEffect(() => {
        initializeFromCookie()
        initializeGlobalSync()
        subscribeToLocalStorage()
        syncFromURL()
        syncFromLocalStorage()
        initialize(initial, space)
    }, [
        initial,
        space,
        initialize,
        initializeFromCookie,
        initializeGlobalSync,
        subscribeToLocalStorage,
        syncFromURL,
        syncFromLocalStorage,
    ])

    useEffect(() => {
        setLayout(view, false)
    }, [view, setLayout])

    useEffect(() => {
        const handlers = {
            popstate: () => syncFromURL(),
            layoutChanged: () => syncFromURL(),
            localStorageChanged: () => syncFromLocalStorage(),
        }

        Object.entries(handlers).forEach(([event, handler]) =>
            window.addEventListener(event, handler)
        )

        const intervalId = setInterval(syncFromLocalStorage, 1000)

        return () => {
            Object.entries(handlers).forEach(([event, handler]) =>
                window.removeEventListener(event, handler)
            )
            clearInterval(intervalId)
        }
    }, [syncFromURL, syncFromLocalStorage])

    const filteredData = getDriveItems({ data: children, query, sortField, sortOrder })
    const props = { data: { value: filteredData }, loadMore: loadingMore, ref, userRole }

    if (isError)
        return (
            <ErrorState
                message={error || 'Failed to load items'}
                title='Error'
                onRetry={loadMore}
            />
        )
    if (isEmpty)
        return <EmptyState description='This folder is empty.' title='Empty Folder' type='empty' />
    if (isNotFound)
        return <EmptyState description='Folder not found.' title='Not Found' type='notFound' />

    return (
        <>
            {layout === 'list' ? <List {...props} /> : <Grid {...props} />}
            <div ref={ref} />
            {!hasMore && totalLoaded > 50 && (
                <div className='text-muted-foreground flex items-center justify-center gap-2 py-6 text-center text-sm'>
                    <CheckCircle className='h-4 w-4' />
                    <span>That's all! You've reached the end of the list</span>
                </div>
            )}
        </>
    )
}
