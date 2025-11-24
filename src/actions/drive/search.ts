'use server'

import { siteConfig } from '@/config/site'
import useHidden from '@/hooks/useHidden'
import { logWarning } from '@/lib/utils'
import { Space } from '@/actions/space'
import { Search, SearchItem } from '@/types/drive'

export async function getSearch(query: string): Promise<Search> {
    const client = await Space()

    if (!client) {
        throw new Error('Space initialization failed')
    }
    const sanitizeQuery = (query: string): string =>
        query
            .replace(/'/g, "''")
            .replace(/[<>?\/]/g, ' ')
            .trim()
            .replace(/\s+/g, ' ')

    try {
        const sanitizedQuery = sanitizeQuery(query)
        const response = await client
            .api(
                `/me/drive/root:/${siteConfig.baseDirectory}:/search(q='${encodeURIComponent(sanitizedQuery)}')`
            )
            .select('id,name,size,lastModifiedDateTime,webUrl,file')
            .get()

        const filteredItems = response.value.filter((c: SearchItem) => !useHidden(c))

        return { value: filteredItems }
    } catch (error: unknown) {
        logWarning('Error:', error instanceof Error ? error.message : error)

        return { value: [] }
    }
}
