import { create } from 'zustand'

import type { DriveItem } from '../types/drive'

export interface ChildStoreState {
    isFolder: (item: DriveItem) => boolean
    isPreviewable: (item: DriveItem) => boolean
    isDownloadable: (item: DriveItem) => boolean
}

export const useChild = create<ChildStoreState>()((_, get) => ({
    isFolder: (item) => !!item.folder,
    isPreviewable: (item) => {
        const previewMimeTypes = ['image/', 'video/']
        const previewExtensions = ['.md', '.mdx']
        const isMimeTypePreviewable = previewMimeTypes.some((type) =>
            item.file?.mimeType?.startsWith(type)
        )
        const isExtensionPreviewable = previewExtensions.some((ext) => item.name?.endsWith(ext))

        return isMimeTypePreviewable || isExtensionPreviewable
    },
    isDownloadable: (item) => {
        const { isFolder, isPreviewable } = get()

        return !isFolder(item) && !isPreviewable(item)
    },
}))
