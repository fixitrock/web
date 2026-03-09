import { DriveItem, SortField, SortOrder } from '@/types/drive'
import { siteConfig } from '@/config/site'
import { getDownloadUrl, isFolder, isPreviewable, sanitizeQuery } from '@/lib/utils'

export function getHref(item: DriveItem): string {
    const path =
        item?.parentReference?.path
            ?.replace(`/drive/root:/${siteConfig.baseDirectory}`, siteConfig.directoryUrl)
            .replace(/\/$/, '') || ''

    if (isFolder(item)) return `${path}/${item.name}`
    if (isPreviewable(item)) return `${path}/?view=${item.name}`

    return getDownloadUrl(item) || ''
}

export function sortItems(
    items: DriveItem[],
    sortField: keyof DriveItem,
    sortOrder: 'asc' | 'desc'
): DriveItem[] {
    return [...items].sort((a, b) => {
        const valA =
            sortField === 'lastModifiedDateTime' ? new Date(a[sortField] || '') : a[sortField] || ''
        const valB =
            sortField === 'lastModifiedDateTime' ? new Date(b[sortField] || '') : b[sortField] || ''

        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1

        return 0
    })
}

export interface DriveItemWithHref extends DriveItem {
    href: string
}

export function getDriveItems({
    data,
    query = '',
    sortField,
    sortOrder = 'asc',
}: {
    data: DriveItem[]
    query?: string
    sortField?: SortField
    sortOrder?: SortOrder
}): DriveItemWithHref[] {
    const sanitizedQuery = sanitizeQuery(query)

    const filtered = !sanitizedQuery.length
        ? data
        : data.filter((item) => {
              const tokens = sanitizeQuery(item.name)

              return sanitizedQuery.every((q) => tokens.some((t) => t.includes(q)))
          })

    const sorted = sortField ? sortItems(filtered, sortField, sortOrder) : filtered

    return sorted.map((item) => ({
        ...item,
        href: getHref(item),
    }))
}

export function formatTitle(text: string | undefined): string {
    if (!text) return ''

    return text
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-')
}
