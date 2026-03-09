'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Revalidate public profile cache
 * Example: user tabs, bio, avatar, etc.
 */
export async function revalidateUser(username: string) {
    await revalidateTag(`user:${username}`, 'max')
}

/**
 * Revalidate seller top stats
 * - top brands
 * - top categories
 * - top products
 */
export async function revalidateSellerTop(username: string) {
    await revalidateTag(`top:${username}`, 'max')
}

/**
 * Revalidate seller top categories
 */
export async function revalidateSellerTopCategories(username: string) {
    await revalidateTag(`top-categories:${username}`, 'max')
}

/**
 * Revalidate seller recent orders
 */
export async function revalidateSellerRecent(username: string) {
    await revalidateTag(`recent:${username}`, 'max')
}

/**
 * Revalidate seller categories
 */
export async function revalidateSellerCategories(username: string) {
    await revalidateTag(`categories:${username}`, 'max')
}

/**
 * Revalidate seller products
 */
export async function revalidateSellerProducts(username: string) {
    await revalidateTag(`products:${username}`, 'max')
}

/**
 * Revalidate EVERYTHING related to this seller
 */
export async function revalidateSellerAll(username: string) {
    await Promise.all([
        revalidateUser(username),
        revalidateSellerTop(username),
        revalidateSellerTopCategories(username),
        revalidateSellerRecent(username),
        revalidateSellerCategories(username),
        revalidateSellerProducts(username),
        revalidatePath(`/@${username}`, 'layout'),
    ])
}

/**
 * Admin action to revalidate any user's cache
 */
export async function revalidateAnyUser(targetUsername: string) {
    const { userSession } = await import('@/actions/user')
    const session = await userSession()

    if (!session?.user || session.user.role !== 3) {
        throw new Error('Unauthorized: Admin access required')
    }

    const cleanUsername = targetUsername.replace(/^@/, '')
    await revalidateSellerAll(cleanUsername)

    return { success: true }
}
