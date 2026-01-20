export type TransactionItem = {
    name: string
    phone: string
    avatar: string
    balance: number
    updated_at: string
}

export type Transaction = [
    page: number,
    total: number,
    empty: boolean,
    hasMore: boolean,
    view: 'seller' | 'user',
    transaction: TransactionItem[],
]
