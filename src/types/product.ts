export type Product = {
    id: string
    seller_id: string // Foreign key to auth.users.id ✅
    name: string
    slug: string
    description: string | null // SQL allows null
    compatibility: string | null // SQL allows null
    category: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    product_variants: ProductVariant[]
    // query?: string                   // optional: you can store the tsvector as string if needed
}

export type ProductVariant = {
    id: string
    product_id: string
    brand: string
    image: string[] | null
    color: { name: string; code: string }
    storage: string
    purchase_price: number
    wholesale_price: number
    price: number
    mrp: number
    quantity: number
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export type Products = Product[]
