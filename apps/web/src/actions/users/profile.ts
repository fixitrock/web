'use server'

import { z } from 'zod'

import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'

const ProfileItemSchema = z.object({
    name: z.string(),
    '@microsoft.graph.downloadUrl': z.string().url().optional(),
})

const ProfileSchema = z.object({
    user: z.object({
        avatar: z.string().url().optional(),
        cover: z.string().url().optional(),
    }),
})

export async function getProfile(username: string) {
    const client = await Space()

    if (!client) throw new Error('Space initialization failed')

    try {
        const response = await client.api(`/me/drive/root:/user/${username}:/children`).get()

        const files = z.array(ProfileItemSchema).parse(response.value)

        const avatar = files.find(
            (item) => item.name === 'avatar.png' && item['@microsoft.graph.downloadUrl']
        )
        const cover = files.find(
            (item) => item.name === 'cover.png' && item['@microsoft.graph.downloadUrl']
        )

        const profile = {
            user: {
                avatar: avatar?.['@microsoft.graph.downloadUrl'] || '',
                cover: cover?.['@microsoft.graph.downloadUrl'] || '',
            },
        }

        ProfileSchema.parse(profile)

        return profile
    } catch (error: unknown) {
        logWarning(`Failed to get profile for ${username}`)
        throw error
    }
}
