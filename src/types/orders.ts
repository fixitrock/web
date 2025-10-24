export type Address = {
    city?: string
    district?: string
    state?: string
    pinCode?: string
    country?: string
}

export type Order = {
    id?: string
    userName: string
    userPhone: string
    userAddress: Address
    sellerID: string
    sellerName: string
    sellerUserName: string
    sellerPhone?: string
    sellerGSTIN?: string
    sellerAddress?: Address
    totalAmount: number
    paid: number
    mode?: 'cash' | 'upi' | 'card' | 'payLater' | null
    note?: string | null
    createdAt?: string
    updatedAt?: string
    products: OrderProduct[]
}

export type OrderProduct = {
    id?: string
    orderID?: string
    productID: string
    name: string
    category?: string
    brand?: string
    color?: { name: string; code: string }
    storage?: string
    serial?: string[]
    price: number
    purchasePrice: number
    quantity: number
    returnedQuantity: number
    total?: number
    createdAt?: string
    updatedAt?: string
}

export type Transaction = {
    id: string
    userPhone: string
    sellerID: string
    orderID?: string | null
    amount: number
    type: 'credit' | 'debit'
    mode?: 'cash' | 'upi' | 'card' | 'bank' | null
    origin_type: string | null
    origin_id: string | null
    origin_qty: number | null
    note?: string | null
    createdAt: string
    updatedAt: string
}

export type CreateTransactionType = {
    userPhone: string
    amount: number
    type: 'credit' | 'debit'
    mode?: string
    notes?: string
}
