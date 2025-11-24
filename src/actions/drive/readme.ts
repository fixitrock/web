'use server'

import { cache } from 'react'

import { siteConfig } from '@/config/site'
import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'

export const getReadme = cache(async function getReadme(slug: string): Promise<string | null> {
    const client = await Space()

    try {
        const res = await client
            .api(`/me/drive/root:/${siteConfig.baseDirectory}${slug}/readme.md`)
            .select('@microsoft.graph.downloadUrl')
            .get()

        const downloadUrl = res['@microsoft.graph.downloadUrl']

        if (!downloadUrl) return null

        const contentRes = await fetch(downloadUrl)

        if (!contentRes.ok) {
            logWarning(`Failed to fetch README.md content for: ${slug}`)

            return null
        }

        const markdown = await contentRes.text()

        return markdown
    } catch (error: unknown) {
        if (error instanceof Error && (error as { statusCode?: number }).statusCode === 404) {
            logWarning(`No README.md found for: ${slug}`)
        } else {
            throw error
        }

        return null
    }
})
