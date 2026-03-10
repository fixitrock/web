'use server'

import { createClient } from '@/supabase/client'

type OrderShareResult = {
    order: Record<string, unknown> | null
    products: Record<string, unknown>[]
}

export async function getOrderShare(share: string): Promise<OrderShareResult | null> {
    const supabase = createClient()

    const { data, error } = await supabase.rpc('ordershare', {
        p_share: share,
    })

    if (error) {
        return null
    }

    if (!data || typeof data !== 'object') {
        return null
    }

    const order = (data as { order?: Record<string, unknown> }).order ?? null
    const products = (data as { products?: Record<string, unknown>[] }).products ?? []

    return { order, products }
}
