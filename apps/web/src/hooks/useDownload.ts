import { useCallback } from 'react'

import { DriveItem } from '@/types/drive'
import { useDownloadStore, DownloadItem } from '@/zustand/store/download'
import { downloadService } from '@/lib/utils/downloadService'
import { logWarning } from '@/lib/utils'

const NOTIFICATION_CONFIG = {
    title: 'Download Started',
    icon: '/favicon.ico',
    tag: 'download',
} as const

const showDownloadNotification = (fileName: string): void => {
    try {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(NOTIFICATION_CONFIG.title, {
                body: `Downloading: ${fileName}`,
                icon: NOTIFICATION_CONFIG.icon,
                tag: NOTIFICATION_CONFIG.tag,
            })
        }
    } catch (error) {
        logWarning('Failed to show download notification:', error)
    }
}

const createDriveItemFromDownload = (downloadItem: DownloadItem): DriveItem => {
    return {
        '@microsoft.graph.downloadUrl': downloadItem.downloadUrl || '',
        id: downloadItem.id,
        name: downloadItem.name,
        eTag: '',
        size: downloadItem.size || 0,
        createdBy: {
            user: {
                email: '',
                id: '',
                displayName: '',
            },
        },
        lastModifiedDateTime: '',
        parentReference: {
            id: '',
            path: '',
        },
        file: {
            mimeType: '',
        },
        folder: {
            childCount: 0,
        },
        thumbnails: [],
        image: {
            height: 0,
            width: 0,
        },
        location: {
            address: {
                city: '',
                countryOrRegion: '',
                locality: '',
                postalCode: '',
                state: '',
            },
            displayName: '',
        },
        photo: {
            cameraMake: undefined,
            cameraModel: undefined,
            exposureDenominator: undefined,
            exposureNumerator: undefined,
            fNumber: undefined,
            focalLength: undefined,
            iso: undefined,
            orientation: undefined,
            takenDateTime: undefined,
        },
        video: {
            duration: 0,
            width: 0,
            height: 0,
        },
    }
}

const createDownloadOptions = (
    itemId: string,
    updateProgress: (
        id: string,
        progress: number,
        downloadedBytes?: number,
        speed?: number
    ) => void,
    startDownload: (id: string) => void,
    completeDownload: (id: string, downloadPath?: string) => void,
    errorDownload: (id: string, error: string) => void
) => ({
    onProgress: (progress: {
        percentage: number
        loaded: number
        speed?: number
        timeRemaining?: number
    }) => {
        // If this is the first progress update (starting download), call startDownload first
        if (progress.loaded > 0 || progress.percentage > 0) {
            startDownload(itemId)
        }
        updateProgress(itemId, progress.percentage, progress.loaded, progress.speed)
    },
    onComplete: (downloadPath?: string) => {
        completeDownload(itemId, downloadPath)
    },
    onError: (error: string) => {
        errorDownload(itemId, error)
    },
})

export function useDownload() {
    const {
        addDownload,
        updateProgress,
        startDownload,
        completeDownload,
        errorDownload,
        pauseDownload: pauseDownloadStore,
        resumeDownload: resumeDownloadStore,
        cancelDownload: cancelDownloadStore,
    } = useDownloadStore()

    const downloadFile = useCallback(
        async (item: DriveItem) => {
            if (!item?.id || !item?.name) {
                logWarning('Invalid download item:', item)

                return
            }

            try {
                addDownload(item)
                showDownloadNotification(item.name)

                const options = createDownloadOptions(
                    item.id,
                    updateProgress,
                    startDownload,
                    completeDownload,
                    errorDownload
                )

                await downloadService.downloadFile(item, options)
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Download failed'

                logWarning('Download failed:', error)
                errorDownload(item.id, errorMessage)
            }
        },
        [addDownload, updateProgress, completeDownload, errorDownload]
    )

    const pauseDownload = useCallback(
        (id: string) => {
            if (!id) {
                logWarning('Invalid download ID for pause:', id)

                return
            }

            try {
                downloadService.pauseDownload(id)
                pauseDownloadStore(id)
            } catch (error) {
                logWarning('Failed to pause download:', error)
            }
        },
        [pauseDownloadStore]
    )

    const resumeDownload = useCallback(
        async (downloadItem: DownloadItem) => {
            if (!downloadItem?.id || !downloadItem?.name) {
                logWarning('Invalid download item for resume:', downloadItem)

                return
            }

            try {
                resumeDownloadStore(downloadItem.id)

                const driveItem = createDriveItemFromDownload(downloadItem)
                const options = createDownloadOptions(
                    driveItem.id,
                    updateProgress,
                    startDownload,
                    completeDownload,
                    errorDownload
                )

                await downloadService.resumeDownload(driveItem.id, driveItem, options)
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Resume failed'

                logWarning('Resume failed:', error)
                errorDownload(downloadItem.id, errorMessage)
            }
        },
        [resumeDownloadStore, updateProgress, completeDownload, errorDownload]
    )

    const cancelDownload = useCallback(
        (id: string) => {
            if (!id) {
                logWarning('Invalid download ID for cancel:', id)

                return
            }

            try {
                downloadService.cancelDownload(id)
                cancelDownloadStore(id)
            } catch (error) {
                logWarning('Failed to cancel download:', error)
            }
        },
        [cancelDownloadStore]
    )

    const cancelAllDownloads = useCallback(() => {
        try {
            downloadService.cancelAllDownloads()
        } catch (error) {
            logWarning('Failed to cancel all downloads:', error)
        }
    }, [])

    const isDownloading = useCallback((id: string) => {
        if (!id) return false

        try {
            return downloadService.isDownloading(id)
        } catch (error) {
            logWarning('Failed to check download status:', error)

            return false
        }
    }, [])

    return {
        downloadFile,
        pauseDownload,
        resumeDownload,
        cancelDownload,
        cancelAllDownloads,
        isDownloading,
    }
}
