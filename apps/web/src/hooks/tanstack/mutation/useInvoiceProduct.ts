import { useMutation } from '@tanstack/react-query'

import { createClient } from '@/supabase/client'
import { InvoiceProduct } from '@/types/invoice'

const supabase = createClient()

export function useInvoiceProduct(invoiceId: string | number) {
    const addProduct = useMutation({
        mutationFn: async (data: Omit<InvoiceProduct, 'id' | 'created_at'>) => {
            const { error, data: inserted } = await supabase
                .from('invoice_product')
                .insert({ ...data, invoice_id: invoiceId })
                .select()
                .single()

            if (error) throw error

            return inserted
        },
    })

    const updateProduct = useMutation({
        mutationFn: async ({ id, ...rest }: Partial<InvoiceProduct> & { id: number | string }) => {
            const { error, data: updated } = await supabase
                .from('invoice_product')
                .update(rest)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            return updated
        },
    })

    const deleteProduct = useMutation({
        mutationFn: async (id: string | number) => {
            const { error } = await supabase.from('invoice_product').delete().eq('id', id)

            if (error) throw error

            return id
        },
    })

    return { addProduct, updateProduct, deleteProduct }
}
