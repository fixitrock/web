'use server'

import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'
import { DriveLink } from '@/types/drive'

export async function getLink(id: string): Promise<DriveLink> {
    const client = await Space()

    if (!client) throw new Error('Space initialization failed')

    try {
        const response = await client.api(`/me/drive/items/${id}/createLink`).post({
            type: 'view',
            scope: 'anonymous',
        })

        if (!response) {
            throw new Error('404: Item not found')
        }

        return response as DriveLink
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error)

        if (message.includes('404')) {
            throw new Error('404: Item not found')
        }

        logWarning(`Failed to fetch drive item for ID ${id}:`, message)
        throw new Error('Failed to fetch drive item')
    }
}
