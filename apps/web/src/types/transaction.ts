export type TransactionItem = {
    id: string
    name: string
    phone: string
    avatar: string
    balance: number
    updated_at: string
}

export interface MyTransaction {
    id: string
    amount: number
    type: 'credit' | 'debit'
    note: string
    notes: string | null
    mode?: string | null
    origin_type?: string | null
    origin_qty?: number | null
    createdAt: string
    orderID: string
    order: {
        id: string
        mode: string | null
        note: string | null
        paid: number
        products: Products[]
    }
}

export type Products = {
    id: string
    name: string
    category: string
    price: number
    quantity: number
    is_fully_returned: boolean
    returned_quantity: number
}

export type TransactionSummary = {
    balance: number
    totalPaid: number
    totalEntries: number
    totalReceived: number
}
