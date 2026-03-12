import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createClient } from '@/supabase/client'
import { Invoice } from '@/types/invoice'
import { queryKeys } from '../query/queryKeys'

const supabase = createClient()

export function useInvoice() {
    const queryClient = useQueryClient()

    const addInvoice = useMutation({
        mutationFn: async (data: Omit<Invoice, 'id' | 'created_at'>) => {
            const { error, data: inserted } = await supabase
                .from('invoice')
                .insert(data)
                .select()
                .single()

            if (error) throw error

            return inserted
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
        },
    })

    const updateInvoice = useMutation({
        mutationFn: async ({ id, ...rest }: Partial<Invoice> & { id: number | string }) => {
            const { error, data: updated } = await supabase
                .from('invoice')
                .update(rest)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            return updated
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all })
        },
    })

    return { addInvoice, updateInvoice }
}
