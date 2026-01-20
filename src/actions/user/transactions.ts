'use server'

import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { TransactionItem } from '@/types/transaction'

export const getBalance = cache(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('balance')

    if (error) {
        return { get: 0, give: 0 }
    }

    return data as { get: number; give: number }
})

export async function myTransactions(search: string, page: number = 1) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('my_transaction', {
        query: search || null,
        page: page,
    })

    return {
        transaction: (data?.transaction ?? []) as TransactionItem[],
        total: data?.total ?? 0,
        empty: Boolean(data?.empty),
        hasMore: Boolean(data?.hasMore),
        page: data?.page ?? page,
        view: data?.view,
        error,
    }
}
