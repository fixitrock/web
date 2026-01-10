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

export interface ReturnData {
    orderId: string
    items: {
        productId: string
        quantity: number
        maxQuantity: number
    }[]
    reason: string
}

export type RecentOrder = {
    id: string
    name: string
    created_at: string
    total_amount: number
    status: string
    item_count: number
}

export type TopItem = {
    name: string
    image: string | null
    sales_count: number
    total_amount: number
}

export type TopStats = {
    top_brands: TopItem[]
    top_categories: TopItem[]
    top_products: TopItem[]
}


export type MyOrders = {
  orders: MyOrderItem[]
  totalOrders: number
  empty: boolean
}

export type MyOrderItem = {
  id: string
  mode: 'cash' | 'upi' | 'card' | 'paylater' | string
  note: string | null
  paid: number
  totalAmount: number

  createdAt: string
  updatedAt: string
  name: string
  phone: string
  username: string | null
  products: MyOrderProduct[]
}

export type MyOrderProduct = {
  id: number
  name: string
}
