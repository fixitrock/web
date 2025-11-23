'use server'

import { createClient } from "@/supabase/server"
import { Order, ReturnData } from "@/types/orders"


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
        p_reason: data.reason
    })

    if (error) {
        console.error('Error processing return:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
