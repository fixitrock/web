import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { DriveItem } from '@/types/drive'

export interface DownloadItem {
    id: string
    name: string
    progress: number
    status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error' | 'native'
    nativeMessage?: string
    error?: string
    startTime: number
    endTime?: number
    size?: number
    speed?: number
    downloadedBytes?: number
    lastUpdateTime?: number
    downloadPath?: string
    downloadUrl?: string
    queuePosition?: number // Position in queue (1-based)
    networkStartTime?: number // When download actually started network request
}

interface DownloadStore {
    downloads: Map<string, DownloadItem>
    _init: () => void
    addDownload: (item: DriveItem) => void
    updateProgress: (id: string, progress: number, downloadedBytes?: number) => void
    updateQueuePositions: () => void
    startDownload: (id: string) => void
    pauseDownload: (id: string) => void
    resumeDownload: (id: string) => void
    cancelDownload: (id: string) => void
    completeDownload: (id: string, downloadPath?: string) => void
    errorDownload: (id: string, error: string) => void
    removeDownload: (id: string) => void
    clearCompleted: () => void
    getActiveDownloads: () => DownloadItem[]
    getCompletedDownloads: () => DownloadItem[]
    getPausedDownloads: () => DownloadItem[]
    getQueuedDownloads: () => DownloadItem[]
    badge: () => boolean
    hasDownloads: () => boolean
}

const ensureDownloadsMap = (downloads: unknown): Map<string, DownloadItem> => {
    if (downloads instanceof Map) {
        return downloads
    }

    return new Map()
}

const safeUpdateDownloads = (
    currentDownloads: Map<string, DownloadItem>,
    updater: (downloads: Map<string, DownloadItem>) => Map<string, DownloadItem>
): Map<string, DownloadItem> => {
    try {
        return updater(new Map(currentDownloads))
    } catch {
        return new Map()
    }
}

export const useDownloadStore = create<DownloadStore>()(
    persist(
        (set, get) => ({
            downloads: new Map(),

            _init: () => {
                const { downloads } = get()
                const safeDownloads = ensureDownloadsMap(downloads)

                if (safeDownloads !== downloads) {
                    set({ downloads: safeDownloads })
                }
            },

            addDownload: (item: DriveItem) => {
                if (!item?.id || !item?.name) {
                    return
                }

                // Hybrid logic: if file > 3GB, use native browser download
                const isNative = (item.size || 0) > 3 * 1024 * 1024 * 1024
                const downloadItem: DownloadItem = {
                    id: item.id,
                    name: item.name,
                    progress: 0,
                    status: isNative ? 'native' : 'queued',
                    startTime: Date.now(),
                    size: item.size || 0,
                    downloadUrl: item['@microsoft.graph.downloadUrl'] || undefined,
                    networkStartTime: undefined,
                    nativeMessage: isNative
                        ? 'File is larger than 3GB. Downloaded via browser.'
                        : undefined,
                }

                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        // For native downloads, always re-add (overwrite) to allow re-trigger
                        // For non-native, only add if not already present
                        if (isNative || !downloads.has(item.id)) {
                            downloads.set(item.id, downloadItem)
                        }

                        return downloads
                    })

                    return { downloads: newDownloads }
                })

                // If native, trigger browser download immediately
                if (isNative && downloadItem.downloadUrl) {
                    // Use a hidden anchor to trigger download
                    if (typeof window !== 'undefined') {
                        const a = document.createElement('a')

                        a.href = downloadItem.downloadUrl
                        a.download = downloadItem.name
                        a.style.display = 'none'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                    }
                } else {
                    // Update queue positions after adding for custom downloads
                    get().updateQueuePositions()
                }
            },

            updateProgress: (
                id: string,
                progress: number,
                downloadedBytes?: number,
                speed?: number
            ) => {
                if (!id || progress < 0 || progress > 100) {
                    return
                }

                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        const download = downloads.get(id)

                        if (download) {
                            const now = Date.now()
                            const lastUpdateTime = download.lastUpdateTime || download.startTime
                            const timeDiff = (now - lastUpdateTime) / 1000

                            // Use passed speed if available (from smart chunked system), otherwise calculate
                            if (speed !== undefined) {
                                download.speed = Math.round(speed)
                            } else if (downloadedBytes !== undefined && timeDiff > 0.2) {
                                const bytesDiff = downloadedBytes - (download.downloadedBytes || 0)

                                if (bytesDiff >= 0) {
                                    // Calculate speed with balanced throttling for optimal performance
                                    const currentSpeed = bytesDiff / timeDiff
                                    const previousSpeed = download.speed || 0

                                    // Use 60% new speed + 40% previous speed for stability
                                    download.speed = Math.round(
                                        currentSpeed * 0.6 + previousSpeed * 0.4
                                    )
                                }
                            }

                            download.progress = Math.max(0, Math.min(100, progress))
                            // Only set status to downloading if it's not already set
                            if (download.status !== 'downloading') {
                                download.status = 'downloading'
                            }
                            download.downloadedBytes = downloadedBytes ?? download.downloadedBytes
                            download.lastUpdateTime = now

                            // Clear queue position when download starts making progress
                            if (progress > 0 || (downloadedBytes && downloadedBytes > 0)) {
                                download.queuePosition = undefined
                            }

                            downloads.set(id, download)
                        }

                        return downloads
                    })

                    return { downloads: newDownloads }
                })
            },

            pauseDownload: (id: string) => {
                if (!id) return

                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        const download = downloads.get(id)

                        if (download && download.status === 'downloading') {
                            download.status = 'paused'
                            downloads.set(id, download)
                        }

                        return downloads
                    })

                    return { downloads: newDownloads }
                })
            },

            resumeDownload: (id: string) => {
                if (!id) return

                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        const download = downloads.get(id)

                        if (download && download.status === 'paused') {
                            download.status = 'downloading'
                            downloads.set(id, download)
                        }

                        return downloads
                    })

                    return { downloads: newDownloads }
                })
            },

            cancelDownload: (id: string) => {
                if (!id) return

                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        downloads.delete(id)

                        return downloads
                    })

                    return { downloads: newDownloads }
                })
            },

            completeDownload: (id: string, downloadPath?: string) => {
                if (!id) return

                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        const download = downloads.get(id)

                        if (download) {
                            download.status = 'completed'
                            download.endTime = Date.now()
                            download.progress = 100
                            download.downloadPath = downloadPath
                            download.speed = undefined
                            download.queuePosition = undefined // Clear queue position
                            downloads.set(id, download)
                        }

                        return downloads
                    })

                    return { downloads: newDownloads }
                })

                // Update queue positions after completion
                get().updateQueuePositions()
            },

            errorDownload: (id: string, error: string) => {
                if (!id || !error) return

                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        const download = downloads.get(id)

                        if (download) {
                            download.status = 'error'
                            download.error = error
                            download.endTime = Date.now()
                            download.speed = undefined
                            downloads.set(id, download)
                        }

                        return downloads
                    })

                    return { downloads: newDownloads }
                })
            },

            removeDownload: (id: string) => {
                if (!id) return

                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        downloads.delete(id)

                        return downloads
                    })

                    return { downloads: newDownloads }
                })
            },

            clearCompleted: () => {
                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        for (const [id, download] of downloads.entries()) {
                            if (download.status === 'completed' || download.status === 'error') {
                                downloads.delete(id)
                            }
                        }

                        return downloads
                    })

                    return { downloads: newDownloads }
                })
            },

            getActiveDownloads: () => {
                const { downloads } = get()
                const safeDownloads = ensureDownloadsMap(downloads)

                if (safeDownloads !== downloads) {
                    set({ downloads: safeDownloads })
                }

                return Array.from(safeDownloads.values()).filter(
                    (download) => download.status === 'downloading'
                )
            },

            getCompletedDownloads: () => {
                const { downloads } = get()
                const safeDownloads = ensureDownloadsMap(downloads)

                if (safeDownloads !== downloads) {
                    set({ downloads: safeDownloads })
                }

                return Array.from(safeDownloads.values()).filter(
                    (download) => download.status === 'completed' || download.status === 'error'
                )
            },

            getPausedDownloads: () => {
                const { downloads } = get()
                const safeDownloads = ensureDownloadsMap(downloads)

                if (safeDownloads !== downloads) {
                    set({ downloads: safeDownloads })
                }

                return Array.from(safeDownloads.values()).filter(
                    (download) => download.status === 'paused'
                )
            },

            getQueuedDownloads: () => {
                const { downloads } = get()
                const safeDownloads = ensureDownloadsMap(downloads)

                if (safeDownloads !== downloads) {
                    set({ downloads: safeDownloads })
                }

                return Array.from(safeDownloads.values()).filter(
                    (download) => download.status === 'queued'
                )
            },

            updateQueuePositions: () => {
                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        // Get downloads that are queued
                        const queuedDownloads = Array.from(downloads.values())
                            .filter((download) => download.status === 'queued')
                            .sort((a, b) => a.startTime - b.startTime) // Sort by start time

                        // Update queue positions
                        queuedDownloads.forEach((download, index) => {
                            download.queuePosition = index + 1 // Queue position (1-based)
                            downloads.set(download.id, download)
                        })

                        return downloads
                    })

                    return { downloads: newDownloads }
                })
            },

            startDownload: (id: string) => {
                if (!id) return

                set((state) => {
                    const currentDownloads = ensureDownloadsMap(state.downloads)
                    const newDownloads = safeUpdateDownloads(currentDownloads, (downloads) => {
                        const download = downloads.get(id)

                        if (
                            download &&
                            (download.status === 'queued' || download.status === 'downloading')
                        ) {
                            // Only update if not already started
                            if (!download.networkStartTime) {
                                download.networkStartTime = Date.now()
                            }
                            download.status = 'downloading'
                            download.queuePosition = undefined // Clear queue position
                            downloads.set(id, download)
                        }

                        return downloads
                    })

                    return { downloads: newDownloads }
                })

                get().updateQueuePositions()
            },
            badge: () => {
                const { getActiveDownloads, getPausedDownloads, getQueuedDownloads } = get()

                const count =
                    getActiveDownloads().length +
                    getPausedDownloads().length +
                    getQueuedDownloads().length

                return count > 0
            },
            hasDownloads: () => {
                const {
                    getActiveDownloads,
                    getPausedDownloads,
                    getCompletedDownloads,
                    getQueuedDownloads,
                } = get()

                const count =
                    getActiveDownloads().length +
                    getPausedDownloads().length +
                    getCompletedDownloads().length +
                    getQueuedDownloads().length

                return count > 0
            },
        }),
        {
            name: 'download-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                downloads: Array.from(state.downloads.entries()),
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    if (!(state.downloads instanceof Map)) {
                        const entries = state.downloads as unknown as [string, DownloadItem][]

                        state.downloads = new Map(entries || [])
                    }

                    setTimeout(() => {
                        const store = useDownloadStore.getState()

                        if (store._init) {
                            store._init()
                        }
                    }, 0)
                }
            },
        }
    )
)
