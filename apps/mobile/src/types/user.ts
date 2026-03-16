export type AppUser = {
    id: string
    auth_id?: string | null
    name?: string | null
    username?: string | null
    phone?: string | null
    avatar?: string | null
    bio?: string | null
    location?: string | null
    verified?: boolean | null
    active?: boolean | null
    created_at?: string | null
    updated_at?: string | null
    role?: number | null
}

export type BalanceSummary = {
    get: number
    give: number
}

export type MyOrderItem = {
    id: string
    mode: string | null
    note: string | null
    paid: number
    totalAmount: number
    createdAt: string
    name: string
    phone: string
    username: string | null
    products: {
        id: string | number
        name: string
        quantity: number
        price: number
    }[]
}

export type MyTransaction = {
    id: string
    amount: number
    type: 'credit' | 'debit'
    note: string | null
    notes: string | null
    createdAt: string
    orderID: string
}

export type TransactionSummary = {
    balance: number
    totalPaid: number
    totalEntries: number
    totalReceived: number
}
