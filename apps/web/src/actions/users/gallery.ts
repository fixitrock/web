'use server'

import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'
import { Thumbnail } from '@/types/drive'
import { GalleryProps, GallerySchema } from '@/types/user'

type DriveItem = {
    name: string
    thumbnails: Thumbnail[]
}

export async function getGallery(username: string): Promise<GalleryProps[]> {
    const client = await Space()

    if (!client) throw new Error('Space initialization failed')

    try {
        const response = await client
            .api(`/me/drive/root:/user/${username}/tour/thumbnails:/children`)
            .select('name')
            .expand('thumbnails($select=large)')
            .get()

        const items: DriveItem[] = response?.value ?? []

        return items
            .map((item) => {
                try {
                    return GallerySchema.parse({
                        name: item.name,
                        thumbnail: item.thumbnails?.[0]?.large?.url || null,
                    })
                } catch {
                    return null
                }
            })
            .filter((item): item is GalleryProps => item !== null)
            .sort((a, b) => b.name.localeCompare(a.name))
    } catch (error: unknown) {
        logWarning(
            `Failed to fetch tour thumbnails for ${username}:`,
            error instanceof Error ? error.message : error
        )

        return []
    }
}
