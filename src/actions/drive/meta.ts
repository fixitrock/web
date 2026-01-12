'use server'

import { unstable_cache } from 'next/cache'

import { siteConfig } from '@/config/site'
import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'

export async function getMeta(meta: string) {
    return unstable_cache(
        async () => {
            const client = await Space()

            if (!client) {
                throw new Error('Space initialization failed')
            }

            try {
                const response = await client
                    .api(`/me/drive/root:/${siteConfig.baseDirectory}/${meta}`)
                    .select('id,name,size,folder,lastModifiedDateTime')
                    .get()

                let thumbnails = null

                if (response?.id) {
                    try {
                        const thumbnailResponse = await client
                            .api(`/me/drive/items/${response.id}:/icon.png`)
                            .expand('thumbnails($select=large)')
                            .get()

                        thumbnails = thumbnailResponse?.thumbnails || null
                    } catch (error: unknown) {
                        if (
                            error instanceof Error &&
                            (error as { statusCode?: number }).statusCode === 404
                        ) {
                            logWarning(`Thumbnails not found for item ${response.id}.`)
                        } else {
                            logWarning(
                                `Unexpected error while fetching thumbnails for item ${response.id}:`,
                                error instanceof Error ? error.message : error
                            )
                        }
                    }
                }

                return {
                    ...response,
                    thumbnails,
                }
            } catch (error: unknown) {
                logWarning(
                    `Failed to fetch metadata for ${meta} from OneDrive (getMeta):`,
                    error instanceof Error ? error.message : error
                )

                return {}
            }
        },
        [`meta:${meta}`],
        {
            tags: [`meta:${meta}`],
            revalidate: 3600,
        }
    )()
}
