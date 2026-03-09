import { DriveItem } from '@/types/drive'

import { getDownloadUrl, logWarning } from './index'

export interface DownloadProgress {
    loaded: number
    total: number
    percentage: number
    speed?: number // Optional speed for smart chunked downloads
    timeRemaining?: number // Optional time remaining for smart chunked downloads
}

export interface DownloadOptions {
    onProgress?: (progress: DownloadProgress) => void
    onComplete?: (downloadPath?: string) => void
    onError?: (error: string) => void
}

interface DownloadData {
    controller: AbortController
    reader?: ReadableStreamDefaultReader<Uint8Array>
    chunks: Uint8Array[]
    loaded: number
    isPaused: boolean
}

export class DownloadService {
    private static instance: DownloadService
    private activeDownloads = new Map<string, DownloadData>()
    private downloadMode = false // Track if downloads are active

    static getInstance(): DownloadService {
        if (!DownloadService.instance) {
            DownloadService.instance = new DownloadService()
        }

        return DownloadService.instance
    }

    async downloadFile(item: DriveItem, options: DownloadOptions = {}): Promise<void> {
        if (!item?.id || !item?.name) {
            options.onError?.('Invalid download item')

            return
        }

        const downloadUrl = getDownloadUrl(item)

        if (!downloadUrl) {
            options.onError?.('Download URL not available')

            return
        }

        // Check if already downloading
        if (this.activeDownloads.has(item.id)) {
            return
        }

        // Start download immediately - no artificial limits
        // Use Promise.resolve().then() to avoid blocking
        Promise.resolve().then(async () => {
            // Small delay to let UI update first
            await new Promise((resolve) => setTimeout(resolve, 10))
            this.startDownload(item, options)
        })
    }

    private async startDownload(item: DriveItem, options: DownloadOptions): Promise<void> {
        const downloadUrl = getDownloadUrl(item)

        if (!downloadUrl) {
            options.onError?.('Download URL not available')

            return
        }

        this.cancelDownload(item.id)

        const controller = new AbortController()
        const downloadData: DownloadData = {
            controller,
            chunks: [],
            loaded: 0,
            isPaused: false,
        }

        this.activeDownloads.set(item.id, downloadData)

        // Enable download mode for better performance
        this.downloadMode = true
        this.enableDownloadMode()

        // Don't update store immediately - let the actual download progress do that
        // The download will start as 'queued' and change to 'downloading' when it makes progress

        try {
            const response = await fetch(downloadUrl, {
                signal: controller.signal,
                // Optimize for concurrent downloads
                keepalive: false, // Allow multiple concurrent connections
                // Use lower priority to avoid blocking other downloads
                priority: 'low',
                // Optimize for large files
                cache: 'no-store',
                // Better performance headers for concurrent downloads
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            if (!response.body) {
                throw new Error('Response body is null')
            }

            const contentLength = response.headers.get('content-length')
            const total = contentLength ? parseInt(contentLength, 10) : 0

            await this.processDownloadStream(response.body, downloadData, total, options, item)
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return
            }

            const errorMessage = error instanceof Error ? error.message : 'Download failed'

            options.onError?.(errorMessage)
            this.activeDownloads.delete(item.id)
        }
    }

    private async processDownloadStream(
        body: ReadableStream<Uint8Array>,
        downloadData: DownloadData,
        total: number,
        options: DownloadOptions,
        item: DriveItem
    ): Promise<void> {
        // Smart chunked download system
        const reader = body.getReader()

        // Performance tracking
        let lastUIUpdate = 0
        let lastSpeedCheck = Date.now()
        const downloadStartTime = Date.now()

        // Smart chunking based on file size
        const isLargeFile = total > 100 * 1024 * 1024 // 100MB+
        const chunkUpdateInterval = isLargeFile ? 500 : 1000 // 500ms for large files, 1s for small

        downloadData.reader = reader

        try {
            while (true) {
                if (downloadData.isPaused) {
                    return
                }

                const { done, value } = await reader.read()

                if (done) break

                if (downloadData.isPaused) {
                    return
                }

                downloadData.chunks.push(value)
                downloadData.loaded += value.length

                const percentage = total > 0 ? Math.round((downloadData.loaded / total) * 100) : 0
                const now = Date.now()

                // Smart chunked progress updates with speed control
                if (now - lastUIUpdate >= chunkUpdateInterval) {
                    // Calculate smart speed based on chunks
                    const timeElapsed = (now - downloadStartTime) / 1000
                    const currentSpeed = timeElapsed > 0 ? downloadData.loaded / timeElapsed : 0

                    // Use actual speed without capping for maximum performance
                    const displaySpeed = currentSpeed

                    // Calculate time remaining based on chunked progress
                    const remainingBytes = total - downloadData.loaded
                    const estimatedTimeRemaining =
                        displaySpeed > 0 ? remainingBytes / displaySpeed : 0

                    options.onProgress?.({
                        loaded: downloadData.loaded,
                        total,
                        percentage,
                        speed: displaySpeed, // Pass calculated speed
                        timeRemaining: estimatedTimeRemaining, // Pass estimated time
                    })

                    lastUIUpdate = now

                    // Update speed check for performance monitoring
                    if (now - lastSpeedCheck >= 1000) {
                        lastSpeedCheck = now
                    }
                }
            }

            if (downloadData.isPaused) {
                return
            }

            await this.completeDownload(downloadData, item, options)
        } finally {
            reader.releaseLock()
        }
    }

    private async completeDownload(
        downloadData: DownloadData,
        item: DriveItem,
        options: DownloadOptions
    ): Promise<void> {
        try {
            const blob = new Blob(downloadData.chunks as BlobPart[])
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')

            link.href = url
            link.download = item.name
            link.style.display = 'none'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            URL.revokeObjectURL(url)
            this.activeDownloads.delete(item.id)

            // Disable download mode if no more downloads
            this.disableDownloadMode()

            const downloadPath = this.getDefaultDownloadPath(item.name)

            options.onComplete?.(downloadPath)
        } catch (error) {
            logWarning('Error completing download:', error)
            options.onError?.('Failed to complete download')
        }
    }

    pauseDownload(id: string): void {
        const downloadData = this.activeDownloads.get(id)

        if (!downloadData) return

        downloadData.isPaused = true

        if (downloadData.reader) {
            try {
                downloadData.reader.cancel()
                downloadData.reader = undefined
            } catch {}
        }

        try {
            downloadData.controller.abort()
        } catch {}

        downloadData.chunks = []
    }

    resumeDownload(id: string, item: DriveItem, options: DownloadOptions = {}): void {
        const downloadData = this.activeDownloads.get(id)

        if (!downloadData) {
            // Download not in service, restart from beginning
            this.downloadFile(item, options)

            return
        }

        if (!downloadData.isPaused) {
            options.onError?.('Download is not paused')

            return
        }

        const downloadUrl = getDownloadUrl(item)

        if (!downloadUrl) {
            options.onError?.('Download URL not available for resume')

            return
        }

        downloadData.isPaused = false

        // If no progress yet (still in starting state), restart the download
        if (downloadData.loaded <= 0) {
            // Remove from active downloads and restart
            this.activeDownloads.delete(id)
            this.downloadFile(item, options)

            return
        }

        // Has progress, continue from where it left off
        downloadData.chunks = []
        this.continueDownload(id, item, options)
    }

    private async continueDownload(
        id: string,
        item: DriveItem,
        options: DownloadOptions
    ): Promise<void> {
        const downloadData = this.activeDownloads.get(id)

        if (!downloadData || downloadData.isPaused) return

        try {
            const downloadUrl = getDownloadUrl(item)

            if (!downloadUrl) {
                logWarning('Download URL not available for resume')

                return
            }

            const newController = new AbortController()

            downloadData.controller = newController

            const response = await fetch(downloadUrl, {
                signal: newController.signal,
                headers: {
                    Range: `bytes=${downloadData.loaded}-`,
                },
                // Optimize for high-speed downloads
                keepalive: true,
                priority: 'high',
                // Download priority headers
                cache: 'no-store',
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            if (!response.body) {
                throw new Error('Response body is null')
            }

            const total = item.size || downloadData.loaded

            await this.processDownloadStream(response.body, downloadData, total, options, item)
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return
            }

            const errorMessage = error instanceof Error ? error.message : 'Resume failed'

            options.onError?.(errorMessage)
        }
    }

    cancelDownload(id: string): void {
        const downloadData = this.activeDownloads.get(id)

        if (!downloadData) return

        // First pause the download to stop the stream processing
        downloadData.isPaused = true

        // Cancel the reader first to stop stream processing
        if (downloadData.reader) {
            try {
                downloadData.reader.cancel()
            } catch {}
        }

        // Then abort the controller
        try {
            downloadData.controller.abort()
        } catch {}

        this.activeDownloads.delete(id)

        // Disable download mode if no more downloads
        this.disableDownloadMode()
    }

    cancelAllDownloads(): void {
        for (const downloadData of this.activeDownloads.values()) {
            // First pause the download to stop the stream processing
            downloadData.isPaused = true

            // Cancel the reader first to stop stream processing
            if (downloadData.reader) {
                try {
                    downloadData.reader.cancel()
                } catch {}
            }

            // Then abort the controller
            try {
                downloadData.controller.abort()
            } catch {}
        }
        this.activeDownloads.clear()

        // Disable download mode when all downloads are cancelled
        this.disableDownloadMode()
    }

    isDownloading(id: string): boolean {
        return this.activeDownloads.has(id)
    }

    getActiveDownloadCount(): number {
        return this.activeDownloads.size
    }

    // Enable download mode for better performance
    private enableDownloadMode(): void {
        // Throttle other network activities
        if (typeof window !== 'undefined') {
            // Reduce other network requests priority
            const originalFetch = window.fetch

            window.fetch = async (input, init = {}) => {
                if (this.downloadMode && this.activeDownloads.size > 0) {
                    // Lower priority for non-download requests
                    init.priority = 'low'
                    init.signal = init.signal || new AbortController().signal
                }

                return originalFetch(input, init)
            }
        }
    }

    // Disable download mode when all downloads complete
    private disableDownloadMode(): void {
        if (this.activeDownloads.size === 0) {
            this.downloadMode = false
        }
    }

    private getDefaultDownloadPath(fileName: string): string {
        return `~/Downloads/${fileName}`
    }
}

export const downloadService = DownloadService.getInstance()
