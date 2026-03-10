'use server'

import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'
import { Drive, DriveItem } from '@/types/drive'

export async function getTour(tour: string): Promise<Drive> {
    const client = await Space()

    if (!client) throw new Error('Space initialization failed')

    async function fetchAllChildren(url: string, items: DriveItem[] = []): Promise<DriveItem[]> {
        try {
            const response = await client.api(url).get()

            items.push(...response.value)

            if (response['@odata.nextLink']) {
                return fetchAllChildren(response['@odata.nextLink'], items)
            }

            return items
        } catch (error: unknown) {
            logWarning(
                `Failed to fetch tour thumbnails for ${tour}:`,
                error instanceof Error ? error.message : error
            )

            return items
        }
    }

    const initialUrl = `/me/drive/root:/user/rockstar/tour/${tour}:/children?select=id,name,file,video&expand=thumbnails($select=large)`

    const value = await fetchAllChildren(initialUrl)

    return { value }
}
