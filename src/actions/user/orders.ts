'use server'

import { createClient, createStaticClient } from '@/supabase/server'
import { Order, RecentOrder, ReturnData, TopStats } from '@/types/orders'
import { unstable_cache } from 'next/cache'

export async function sellerOrders(search: string) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('sellerorders', { query: search })

    return {
        orders: (data?.orders ?? []) as Order[],
        total: data?.totalOrders ?? 0,
        empty: Boolean(data?.empty),
        error,
    }
}

export async function processReturn(data: ReturnData) {
    const supabase = await createClient()

    const { error } = await supabase.rpc('process_return', {
        p_order_id: data.orderId,
        p_items: data.items,
        p_reason: data.reason,
    })

    if (error) {
        console.error('Error processing return:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function sellerRecentOrders(username: string) {
    return unstable_cache(
        async () => {
            const supabase = await createStaticClient()

            const { data, error } = await supabase.rpc('seller_recent_orders', {
                p_username: username,
            })

            if (error) {
                console.error('[sellerRecentOrders] error:', error)
                return []
            }

            return data as RecentOrder[]
        },
        [`recent:@${username}`],
        {
            tags: [`recent:@${username}`],
            revalidate: 3600,
        }
    )()
}

export async function sellerTop(username: string) {
    return unstable_cache(
        async () => {
            const supabase = await createStaticClient()

            const { data, error } = await supabase.rpc('seller_top', {
                p_username: username,
            })

            if (error) {
                console.error('[sellerTop] error:', error)
                return {
                    top_brands: [],
                    top_categories: [],
                    top_products: [],
                }
            }

            return data as TopStats
        },
        [`top:@${username}`],
        {
            tags: [`top:@${username}`],
            revalidate: 3600,
        }
    )()
}