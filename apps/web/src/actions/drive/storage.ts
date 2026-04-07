'use server'

import { z } from 'zod'

import { siteConfig } from '@/config/site'
import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'

const StorageSchema = z.object({
    remaining: z.number(),
    state: z.enum(['normal', 'nearing', 'critical', 'exceeded', 'server']),
    total: z.number(),
    used: z.number(),
})

export type StorageType = z.infer<typeof StorageSchema>

const FolderSchema = z.object({
    name: z.string(),
    size: z.number(),
})

export type FolderType = z.infer<typeof FolderSchema>

const StorageDataSchema = z.object({
    storage: StorageSchema,
    folders: z.array(FolderSchema),
})

export type StorageData = z.infer<typeof StorageDataSchema>

const paths = [
    `/${siteConfig.baseDirectory}/Apple`,
    `/${siteConfig.baseDirectory}/Apps`,
    `/${siteConfig.baseDirectory}/Games`,
]

export async function getStorage(): Promise<StorageData> {
    const client = await Space()

    if (!client) {
        throw new Error('Space initialization failed')
    }

    try {
        // Fetch storage details
        const storageDetails = await client.api('/me/drive').select('quota').get()

        const { quota } = storageDetails

        if (!quota) {
            throw new Error('Quota information is unavailable')
        }

        const storage = StorageSchema.parse({
            remaining: quota.remaining,
            state: quota.state,
            total: quota.total,
            used: quota.used,
        })

        const folders = await Promise.all(
            paths.map(async (path) => {
                try {
                    const folderDetails = await client
                        .api(`/me/drive/root:${path}`)
                        .select('size,name')
                        .get()

                    if (!folderDetails || !folderDetails.size || !folderDetails.name) {
                        throw new Error(`Details unavailable for folder at ${path}`)
                    }

                    return FolderSchema.parse({
                        name: folderDetails.name,
                        size: folderDetails.size,
                    })
                } catch (error) {
                    logWarning(
                        `Failed to fetch details for folder at ${path}:`,
                        error instanceof Error ? error.message : 'Unknown error'
                    )

                    return FolderSchema.parse({
                        name: path.replace('/', ''),
                        size: 0,
                    })
                }
            })
        )

        return StorageDataSchema.parse({ storage, folders })
    } catch (error: unknown) {
        if (error instanceof Error) {
            logWarning('Failed to fetch drive storage details:', error.message)
        } else {
            logWarning('An unknown error occurred while fetching drive storage details.')
        }

        return StorageDataSchema.parse({
            storage: {
                remaining: 0,
                state: 'normal',
                total: 0,
                used: 0,
            },
            folders: paths.map((path) => ({
                name: path.replace('/', ''),
                size: 0,
            })),
        })
    }
}
