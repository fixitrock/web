import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { User } from '@/app/login/types'
import { siteConfig } from '@/config/site'
import { DriveItem } from '@/types/drive'
import { Product } from '@/types/product'
import { bucketUrl } from '@/supabase/bucket'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function openCurrentLocationInMaps() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.')

        return
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`

        window.open(url, '_blank')
    })
}
export const Counts = (num: number): string => {
    if (num < 1000) {
        return num.toString()
    } else if (num < 1000000) {
        return (num / 1000).toFixed(1) + 'k'
    } else if (num < 1000000000) {
        return (num / 1000000).toFixed(1) + 'M'
    } else {
        return (num / 1000000000).toFixed(1) + 'B'
    }
}

export function logWarning(_message: string, _error?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
        // Mark variables as used in a no-op way
        void _message
        void _error

        // Custom logging mechanism to avoid console.warn
        // For example, you can send logs to a logging service
        // sendLogToService('warn', _message, _error);
    }
}

export const sanitizeQuery = (query: string): string[] => {
    // Normalize and tokenize the query into an array of words
    return query
        .toLowerCase() // Convert to lowercase for case-insensitive matching
        .replace(/[^a-z0-9\s]/gi, ' ') // Replace non-alphanumeric characters with spaces
        .trim() // Remove leading and trailing spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .split(' ') // Split into an array of words
}

export const getPreviewTypes = ['image/', 'video/']
export const previewExtensions = ['.md', '.mdx']

export const isPreviewable = (c: DriveItem) => {
    const isMimeTypePreviewable = getPreviewTypes.some((type) => c.file?.mimeType?.startsWith(type))
    const isExtensionPreviewable = previewExtensions.some((ext) => c.name?.endsWith(ext))

    return isMimeTypePreviewable || isExtensionPreviewable
}

export const isFolder = (c: DriveItem) => {
    return !!c.folder
}

export const getDownloadUrl = (c: DriveItem) => {
    return c['@microsoft.graph.downloadUrl']
}

export const cUrl = (c: DriveItem, pathname: string) => {
    if (isFolder(c)) {
        return `${pathname === '/' ? '' : pathname}/${c.name}`
    }
    if (isPreviewable(c)) {
        return `${pathname === '/' ? '' : pathname}?view=${c.name}`
    }

    return getDownloadUrl(c)
}

export const stateColors = {
    normal: 'bg-blue-500 text-blue-500',
    nearing: 'bg-yellow-500 text-yellow-500',
    critical: 'bg-red-500 text-red-500',
    exceeded: 'bg-purple-500 text-purple-500',
    server: 'bg-red-500 text-red-500',
}

export const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price)
}

export const getStockStatus = (qty: number) => {
    if (qty === 0) return { color: 'bg-red-400' as const, text: 'Sold Out' }
    if (qty <= 1) return { color: 'bg-amber-400' as const, text: 'Low Stock' }

    return { color: 'bg-emerald-400' as const, text: 'In Stock' }
}

export const getProductImage = (product: Product): string | undefined => {
    if (!product.variants?.[0]?.image || product.variants[0].image.length === 0) {
        if (product.category) {
            return (
                bucketUrl(
                    '/assets/categories/' +
                        product.category.toLowerCase().replace(/\s+/g, '-') +
                        '.png'
                ) ?? undefined
            )
        }
        return undefined
    }

    const firstImage = product.variants[0].image[0]
    if (typeof firstImage === 'string') {
        return bucketUrl(firstImage) ?? undefined
    }
    return undefined
}

export function formatDateTime(dateTimeString?: string | null | undefined): string {
    if (!dateTimeString) {
        return ''
    }

    const date = new Date(dateTimeString)

    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string provided')
    }

    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const SECOND = 1
    const MINUTE = 60 * SECOND
    const HOUR = 60 * MINUTE
    const DAY = 24 * HOUR
    const WEEK = 7 * DAY

    const pluralize = (count: number, singular: string) =>
        `${count} ${singular}${count === 1 ? '' : 's'}`

    if (diffInSeconds < MINUTE) {
        return pluralize(diffInSeconds, 'sec') + ' ago'
    } else if (diffInSeconds < HOUR) {
        const minutes = Math.floor(diffInSeconds / MINUTE)

        return pluralize(minutes, 'min') + ' ago'
    } else if (diffInSeconds < DAY) {
        const hours = Math.floor(diffInSeconds / HOUR)

        return pluralize(hours, 'hr') + ' ago'
    } else if (diffInSeconds < WEEK) {
        const days = Math.floor(diffInSeconds / DAY)

        return pluralize(days, 'day') + ' ago'
    } else {
        // Manually format the date as "6 Aug 2023"
        const day = date.getDate()
        const month = date.toLocaleString('en-US', { month: 'short' })
        const year = date.getFullYear()

        return `${day} ${month} ${year}`
    }
}

export function formatCount(count: number): string {
    if (count === 0) {
        return '0 File'
    } else if (count === 1) {
        return '1 File'
    } else {
        return `${count} Files`
    }
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

export function deslugify(text: string): string {
    return text
        .trim()
        .toLowerCase()
        .replace(/-/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
}

export function path(url: string, isFile?: boolean) {
    const path = url
        .replace(
            `https://fixitrock-my.sharepoint.com/personal/space_fixitrock_com/Documents/${siteConfig.baseDirectory}`,
            `${siteConfig.directoryUrl}`
        )
        .trim()

    if (isFile) {
        const parts = path.split('/')
        const fileName = parts.pop()
        const folderPath = parts.join('/')

        return `${folderPath}#${fileName}`.toLowerCase()
    }

    return path.toLowerCase()
}

export const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000) // Convert milliseconds to seconds
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Get user avatar URL with fallback based on gender and cache busting
 * @param user - User object with avatar, gender, and updated_at
 * @returns Avatar URL string
 */
export function userAvatar(user: User): string {
    const fallbackAvatar =
        user?.gender === 'female'
            ? '/fallback/girl.png'
            : user?.gender === 'other'
              ? '/fallback/other.png'
              : '/fallback/boy.png'

    const avatarUrl = bucketUrl(user?.avatar as string) || fallbackAvatar || ''

    // Add cache busting parameter if user has been updated
    return user?.updated_at ? `${avatarUrl}?t=${user.updated_at}` : avatarUrl
}

// Download progress utilities
export { getDownloadBackground } from './downloadProgress'

/**
 * Wraps server actions with consistent error handling
 * This ensures all errors are properly caught and don't crash the UI
 */
export function withErrorHandling<Args extends unknown[], Return>(
    fn: (...args: Args) => Promise<Return>
) {
    return async (...args: Args): Promise<Return> => {
        try {
            return await fn(...args)
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message)
            } else if (typeof error === 'string') {
                throw new Error(error)
            } else if (error && typeof error === 'object' && 'message' in error) {
                throw new Error((error as { message: string }).message)
            } else {
                throw new Error('An unexpected error occurred')
            }
        }
    }
}

/**
 * Creates a safe server action that returns structured error responses
 * instead of throwing errors
 */
export function createSafeAction<T extends readonly unknown[], R>(
    action: (...args: T) => Promise<R>
): (...args: T) => Promise<{ success: boolean; data?: R; error?: string }> {
    return async (...args: T) => {
        try {
            const result = await action(...args)

            return { success: true, data: result }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'An unexpected error occurred'

            return { success: false, error: errorMessage }
        }
    }
}

export function getGreeting() {
    const hour = new Date().getHours()

    if (hour >= 0 && hour < 4) return 'Ready to rock the night'
    if (hour >= 4 && hour < 12) return 'Time to crush it'
    if (hour >= 12 && hour < 17) return "Let's make moves"
    if (hour >= 17 && hour < 21) return 'Still got energy'

    return 'Night mode activated'
}

export function HeyYou(name?: string | null) {
    const hour = new Date().getHours()

    if (hour >= 0 && hour < 3) return `Late night, ${name}`
    if (hour >= 3 && hour < 6) return `Early start, ${name}`
    if (hour >= 6 && hour < 9) return `Good morning, ${name}`
    if (hour >= 9 && hour < 12) return `Morning, ${name}`
    if (hour >= 12 && hour < 15) return `Good afternoon, ${name}`
    if (hour >= 15 && hour < 18) return `Afternoon, ${name}`
    if (hour >= 18 && hour < 21) return `Good evening, ${name}`
    if (hour >= 21 && hour < 24) return `Evening, ${name}`

    return `Hello, ${name}`
}

/**
 * Capitalizes the first letter of a string
 * @param text - The text to capitalize
 * @returns The text with the first letter capitalized
 */
export function capitalize(text: string): string {
    if (!text) return text

    return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatNumber(num: number): string {
    if (num < 1000) {
        return num.toString()
    } else if (num < 1_000_000) {
        return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K'
    } else if (num < 1_000_000_000) {
        return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + 'M'
    } else {
        return (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1) + 'B'
    }
}

export function formatDiscount(price: number, mrp: number) {
    if (!price || !mrp || mrp <= 0 || price >= mrp) {
        return { off: '', discount: 0 }
    }

    const discount = Math.round(((mrp - price) / mrp) * 100)

    return {
        off: `${discount}% off`,
        discount: formatPrice(discount),
    }
}

export function formatPhone(phone?: string | null): string {
    if (!phone) return 'N/A'
    return phone.replace(/^91/, '')
}
