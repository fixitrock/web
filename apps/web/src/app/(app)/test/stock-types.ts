export type StockFilter = 'out' | 'low' | 'both'

export type StockUrgency = 'out' | 'low'

export type StockEntry = {
    variantId: string
    category: string
    productName: string
    brand: string
    quantity: number
    purchasePrice: number | null
    colors: string[]
    urgency: StockUrgency
}

export type PurchaseTask = {
    taskId: string
    variantId: string
    category: string
    productName: string
    brand: string
    currentQty: number
    targetQty: number
    purchasePrice: number | null
    checked: boolean
    note: string
}
