'use server'

import { revalidateTag } from 'next/cache'

/**
 * Revalidate public profile cache
 * Example: user tabs, bio, avatar, etc.
 */
export async function revalidateUser(username: string) {
    await revalidateTag(`user:${username}`, 'max')
}

/**
 * Revalidate seller top stats:
 * - top brands
 * - top categories
 * - top products
 */
export async function revalidateSellerTop(username: string) {
    await revalidateTag(`top:${username}`, 'max')
}

/**
 * Revalidate seller recent orders
 */
export async function revalidateSellerRecent(username: string) {
    await revalidateTag(`recent:${username}`, 'max')
}

/**
 * Revalidate EVERYTHING related to this seller
 */
export async function revalidateSellerAll(username: string) {
    await Promise.all([
        revalidateUser(username),
        revalidateSellerTop(username),
        revalidateSellerRecent(username),
    ])
}
