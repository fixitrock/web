import { useEffect, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

import { getChildren } from '@/actions/drive'
import { useDriveStore } from '@/zustand/store'

interface UseDriveDataProps {
    space: string
    pageSize?: number
}

export function useDriveData({ space, pageSize = 50 }: UseDriveDataProps) {
    const {
        children,
        nextPage,
        loading,
        loadingMore,
        error,
        status,
        hasMore,
        totalLoaded,
        setLoadingMore,
        setError,
        setStatus,
        appendItems,
        updatePagination,
        setHasMore,
    } = useDriveStore()

    const spaceRef = useRef(space)
    const pageSizeRef = useRef(pageSize)

    useEffect(() => {
        spaceRef.current = space
        pageSizeRef.current = pageSize
    }, [space, pageSize])

    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
        triggerOnce: false,
    })

    const loadMore = useCallback(async () => {
        if (!nextPage || loadingMore || !hasMore) return

        try {
            setLoadingMore(true)
            setError(null)

            const response = await getChildren(
                `/${spaceRef.current}`,
                nextPage,
                pageSizeRef.current
            )

            if (response?.value?.length > 0) {
                appendItems(response.value)
                updatePagination(response)
                setStatus('success')
            } else {
                setStatus('empty')
                setHasMore(false)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more items')
            setStatus('error')
        } finally {
            setLoadingMore(false)
        }
    }, [
        nextPage,
        loadingMore,
        hasMore,
        setLoadingMore,
        setError,
        appendItems,
        updatePagination,
        setStatus,
        setHasMore,
    ])

    useEffect(() => {
        if (inView && hasMore && !loadingMore) {
            loadMore()
        }
    }, [inView, hasMore, loadingMore, loadMore])

    useEffect(() => {
        const currentSpace = useDriveStore.getState().currentSpace

        if (currentSpace && currentSpace !== space) {
            useDriveStore.getState().reset()
        }
    }, [space])

    return {
        children,
        totalLoaded,
        loading,
        loadingMore,
        error,
        status,
        hasMore,
        loadMore,
        ref,
        isEmpty: status === 'empty',
        isNotFound: status === 'notFound',
        isError: status === 'error',
        isLoading: loading || loadingMore,
    }
}
