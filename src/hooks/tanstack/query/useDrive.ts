'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter as topLoaderRouter, usePathname } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import { getDownloadUrl, isFolder, isPreviewable, sanitizeQuery } from '@/lib/utils'
import { Drive, DriveItem, SortField, SortOrder } from '@/types/drive'
import { getChildren } from '@/actions/drive'
import { siteConfig } from '@/config/site'
import { useSearchParams } from '@/hooks/useSearchParams'

export function useDrive(slug: string, top?: number) {
    const [query, setQuery] = useState('')
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
    const [selectedItem, setSelectedItem] = useState<DriveItem | null>(null)
    const [focus, setFocus] = useState<DriveItem | null>(null)
    const [open, setPreviewOpen] = useState(false)

    const router = useRouter()
    const topLoader = topLoaderRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { ref, inView } = useInView()

    const { data, isFetchingNextPage, hasNextPage, fetchNextPage, status, error } =
        useInfiniteQuery({
            queryKey: ['Drive', slug],
            queryFn: async ({ pageParam }) => {
                const response = await getChildren(slug, pageParam, top)

                return response
            },
            initialPageParam: '',
            refetchOnWindowFocus: false,
            getNextPageParam: (lastPage) => lastPage['@odata.nextLink'] || undefined,
        })

    const combinedData = useMemo(() => data?.pages.flatMap((page) => page.value) || [], [data])

    const sanitizedQuery = useMemo(() => sanitizeQuery(query), [query])

    const filteredData = useMemo(() => {
        if (!combinedData.length) return []

        return combinedData.filter((item) => {
            const itemNameTokens = sanitizeQuery(item.name)

            return sanitizedQuery.every((token) =>
                itemNameTokens.some((namePart) => namePart.includes(token))
            )
        })
    }, [combinedData, sanitizedQuery])

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const getFieldValue = (item: DriveItem, field: SortField) =>
                field === 'lastModifiedDateTime' ? new Date(item[field] || '') : item[field] || ''

            const fieldA = getFieldValue(a, sortField)
            const fieldB = getFieldValue(b, sortField)

            if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1
            if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1

            return 0
        })
    }, [filteredData, sortField, sortOrder])

    const getHref = useCallback((item: DriveItem): string => {
        const path =
            item?.parentReference?.path
                ?.replace(`/drive/root:/${siteConfig.baseDirectory}`, siteConfig.directoryUrl)
                .replace(/\/$/, '') || ''

        if (isFolder(item)) return `${path}/${item.name}`
        if (isPreviewable(item)) return `${path}/?view=${item.name}`

        return getDownloadUrl(item) || ''
    }, [])

    const itemsWithHref = useMemo(
        () => sortedData.map((item) => ({ ...item, href: getHref(item) })),
        [sortedData, getHref]
    )

    const driveData: Drive | undefined = combinedData.length
        ? {
              value: itemsWithHref,
              '@odata.nextLink': data?.pages[data.pages.length - 1]['@odata.nextLink'],
          }
        : undefined

    const sort = (field: SortField, order: SortOrder) => {
        setSortField(field)
        setSortOrder(order)
    }

    const setOpen = () => {
        setPreviewOpen(false)
        topLoader.push(pathname, { scroll: false })
    }

    const selectItem = (item: DriveItem) => {
        setSelectedItem(item)

        if (isFolder(item)) {
            router.push(getHref(item))
        } else if (isPreviewable(item)) {
            topLoader.push(getHref(item), { scroll: false })
            setPreviewOpen(true)
        } else {
            const downloadUrl = getDownloadUrl(item)

            if (downloadUrl) window.location.href = downloadUrl
        }
    }

    const handleHashChange = useCallback(() => {
        const hash = window.location.hash.slice(1)

        if (!hash) {
            setFocus(null)

            return
        }

        const itemToHighlight = combinedData.find((item) => item.name === hash)

        setFocus(itemToHighlight || null)
    }, [combinedData])

    useEffect(() => {
        handleHashChange()
        window.addEventListener('hashchange', handleHashChange)

        return () => {
            window.removeEventListener('hashchange', handleHashChange)
        }
    }, [handleHashChange])

    useEffect(() => {
        if (inView && hasNextPage) fetchNextPage()
    }, [inView, hasNextPage, fetchNextPage])

    useEffect(() => {
        const viewFileName = searchParams?.get('view')

        if (!viewFileName) return

        const itemToPreview = combinedData.find((item) => item.name === viewFileName)

        if (itemToPreview && isPreviewable(itemToPreview)) {
            setSelectedItem(itemToPreview)
            setPreviewOpen(true)
            topLoader.push(getHref(itemToPreview), { scroll: false })
        }
    }, [combinedData, searchParams, topLoader, getHref])

    return {
        data: driveData,
        isLoading: status === 'pending',
        query,
        setQuery,
        sort,
        selectedItem,
        focus,
        open,
        setOpen,
        selectItem,
        ref,
        loadMore: isFetchingNextPage,
        status: data?.pages[data.pages.length - 1]?.status,
        error,
    }
}
