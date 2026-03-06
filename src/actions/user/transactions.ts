'use server'

import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { TransactionItem, MyTransaction, TransactionSummary } from '@/types/transaction'

export const getBalance = cache(async () => {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('balance')

    if (error) {
        return { get: 0, give: 0 }
    }

    return data as { get: number; give: number }
})

export async function myTransaction(search: string, page: number = 1) {
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

export async function myTransactions(id: string, page: number = 1) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('my_transactions', {
        u_id: id || null,
        page: page,
    })

    return {
        transactions: (data?.transactions ?? []) as MyTransaction[],
        total: data?.total ?? 0,
        empty: Boolean(data?.empty),
        hasMore: Boolean(data?.hasMore),
        summary: data?.summary as TransactionSummary,
        page: data?.page ?? page,
        seller: Boolean(data?.seller),
        error,
    }
}
