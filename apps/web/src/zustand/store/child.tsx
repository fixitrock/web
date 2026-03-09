import { create } from 'zustand'

import { DriveItem } from '@/types/drive'

export interface ItemTypeState {
    isFolder: (c: DriveItem) => boolean
    isPreviewable: (c: DriveItem) => boolean
    isDownloadable: (c: DriveItem) => boolean
}

export const useChild = create<ItemTypeState>()((set, get) => ({
    isFolder: (c: DriveItem) => {
        return !!c.folder
    },

    isPreviewable: (c: DriveItem) => {
        const getPreviewTypes = ['image/', 'video/']
        const previewExtensions = ['.md', '.mdx']

        const isMimeTypePreviewable = getPreviewTypes.some((type) =>
            c.file?.mimeType?.startsWith(type)
        )
        const isExtensionPreviewable = previewExtensions.some((ext) => c.name?.endsWith(ext))

        return isMimeTypePreviewable || isExtensionPreviewable
    },

    isDownloadable: (c: DriveItem) => {
        const { isFolder, isPreviewable } = get()

        return !isFolder(c) && !isPreviewable(c)
    },
}))
