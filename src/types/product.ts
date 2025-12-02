export type Product = {
    id: string
    seller_id?: string
    name: string
    slug?: string
    description: string
    compatibility: string
    category: string
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
    variants: ProductVariant[]
}

export type ProductVariant = {
    id: string
    product_id?: string
    brand: string
    image: (string | File)[]
    files?: File[]
    color: { name: string; hex: string } | null
    storage: string
    purchase_price: number
    wholesale_price: number
    price: number
    mrp: number
    quantity: number
    created_at?: string
    updated_at?: string
    deleted_at?: string | null
}

export type Products = Product[]

export type Category = {
    count: number
    category: string
}

export type Categories = Category[]
