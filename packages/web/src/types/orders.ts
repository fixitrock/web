export type Address = {
    city?: string
    district?: string
    state?: string
    pinCode?: string
    country?: string
}

export type Order = {
    id?: string
    share?: string | null
    user_id: string
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
    mode?: 'cash' | 'upi' | 'card' | 'paylater' | null
    note?: string | null
    createdAt?: string
    updatedAt?: string
    products: OrderProduct[]
    isFullyReturned?: boolean
    orderReturnType?: 'none' | 'partial' | 'full'
}

export type OrderProduct = {
    id?: string
    orderID?: string
    productID: string
    image: string | null
    name: string
    category?: string
    brand?: string
    color?: { name: string; hex: string }
    storage?: string
    serial?: string[]
    price: number
    purchasePrice: number
    quantity: number
    returnedQuantity: number
    total?: number
    createdAt?: string
    updatedAt?: string
    returnedAt?: string
    isFullyReturned: boolean
    returnType: 'none' | 'partial' | 'full'
}

export type Transaction = {
    id: string
    user_id: string
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
