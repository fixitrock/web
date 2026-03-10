'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useRouter as topLoaderRouter, usePathname } from 'next/navigation'
import { useRouter } from 'nextjs-toploader/app'
import React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import { getMemoirs } from '@/actions/users'
import { useSearchParams } from '@/hooks/useSearchParams'
import { getDownloadUrl, isFolder, isPreviewable } from '@/lib/utils'
import { DriveItem } from '@/types/drive'

export function useMemoirs(slug: string) {
    const { ref, inView } = useInView()
    const [selectedItem, setSelectedItem] = useState<DriveItem | null>(null)
    const [open, setPreviewOpen] = React.useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const topLoader = topLoaderRouter()
    const pathname = usePathname()

    const query = useInfiniteQuery({
        queryKey: ['Memoirs', slug],
        queryFn: async ({ pageParam }) => {
            const response = await getMemoirs(slug, pageParam)

            return response
        },
        initialPageParam: '',
        refetchOnWindowFocus: false,
        getNextPageParam: (lastPage) => lastPage['@odata.nextLink'] || undefined,
    })
    const data = useMemo(() => query.data?.pages.flatMap((page) => page.value) || [], [query.data])

    const getHref = useCallback((item: DriveItem): string => {
        const path =
            item?.parentReference?.path
                ?.replace(`/drive/root:/user/rockstar/memoirs/`, '')
                .replace(/\/$/, '') || ''

        if (isFolder(item)) return `${path}/${item.name}`
        if (isPreviewable(item)) return `${path}/?view=${item.name}`

        return getDownloadUrl(item) || ''
    }, [])

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

    useEffect(() => {
        const viewFileName = searchParams?.get('view')

        if (!viewFileName) return

        const itemToPreview = data.find((item) => item.name === viewFileName)

        if (itemToPreview && isPreviewable(itemToPreview)) {
            setSelectedItem(itemToPreview)
            setPreviewOpen(true)
            topLoader.push(getHref(itemToPreview), { scroll: false })
        }
    }, [data, searchParams, topLoader, getHref])

    const setOpen = () => {
        setPreviewOpen(false)
        topLoader.push(pathname, { scroll: false })
    }

    useEffect(() => {
        if (inView && query.hasNextPage) query.fetchNextPage()
    }, [inView, query.hasNextPage, query.fetchNextPage])

    return { ...query, ref, data, selectItem, selectedItem, open, setOpen }
}
