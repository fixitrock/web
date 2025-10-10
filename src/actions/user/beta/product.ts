'use server'

import type { Products } from '@/types/product'

import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { logWarning } from '@/lib/utils'

/**
 * Internal helper to get user ID by username.
 */
const getUserId = cache(async (username: string): Promise<string | null> => {
    const supabase = await createClient()
    const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle()

    if (error) {
        logWarning('Error fetching user ID:', error.message)

        return null
    }

    return user?.id ?? null
})

/**
 * Fetch user products with optional category filter.
 */
export const userProducts = cache(
    async (
        username: string,
        category?: string
    ): Promise<{ products: Products; error: string | null; empty: boolean }> => {
        const supabase = await createClient()
        const userId = await getUserId(username)

        if (!userId) {
            return { products: [], error: 'User not found', empty: true }
        }

        let query = supabase
            .from('product')
            .select('*')
            .eq('user_id', userId)
            .order('id', { ascending: false })

        if (category && category !== 'all') {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        return {
            products: (data ?? []) as Products,
            error: error ? error.message : null,
            empty: !data || data.length === 0,
        }
    }
)

/**
 * Fetch all categories for a given user.
 */
export const userCategories = cache(
    async (
        username: string
    ): Promise<{ categories: string[]; error: string | null; empty: boolean }> => {
        const supabase = await createClient()
        const userId = await getUserId(username)

        if (!userId) {
            return { categories: [], error: 'User not found', empty: true }
        }

        const { data, error } = await supabase
            .from('product_categories')
            .select('category')
            .eq('user_id', userId)
            .order('category', { ascending: true })

        const categories = data?.map((c) => c.category) ?? []

        return {
            categories,
            error: error ? error.message : null,
            empty: categories.length === 0,
        }
    }
)
