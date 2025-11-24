'use server'

import { cache } from 'react'

import { siteConfig } from '@/config/site'
import useHidden from '@/hooks/useHidden'
import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'
import { Drive, DriveItem } from '@/types/drive'

async function getThumbnails(id: string): Promise<DriveItem['thumbnails'] | null> {
    const client = await Space()

    try {
        const res = await client
            .api(`/me/drive/items/${id}:/icon.png`)
            .expand('thumbnails($select=large)')
            .get()

        return res.thumbnails || null
    } catch (error: unknown) {
        if (error instanceof Error && (error as { statusCode?: number }).statusCode === 404) {
            logWarning(`No thumbnail for folder: ${id}`)
        } else {
            throw error
        }

        return null
    }
}

export const getChildren = cache(async function getChildren(
    slug: string,
    pageParam?: string,
    top: number = 50
): Promise<Drive> {
    try {
        const client = await Space()

        if (!client) throw new Error('Space init failed')

        const endpoint =
            pageParam || `/me/drive/root:/${siteConfig.baseDirectory}${slug}:/children?top=${top}`

        const res = await client.api(endpoint).expand('thumbnails($select=large)').get()

        if (!res.value?.length) return { value: [], status: 'empty' }

        const child = await Promise.all(
            res.value.map(async (child: DriveItem) => {
                if (useHidden(child)) return null

                let thumbs = child.thumbnails?.length ? child.thumbnails : null

                if (child.folder) {
                    thumbs = (await getThumbnails(child.id)) || thumbs
                }

                return { ...child, thumbnails: thumbs }
            })
        )

        return {
            ...res,
            value: child.filter(Boolean) as DriveItem[],
            status: 'success',
        }
    } catch (error: unknown) {
        logWarning(error instanceof Error ? error.message : '')
        throw error
    }
})
