import { z } from 'zod'

export const ProductSchema = z.object({
    id: z.number(),
    user_id: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    compatible: z.string(),
    description: z.string().optional(),
    img: z.array(z.string()).optional(),
    purchase: z.number(),
    staff_price: z.number().optional(),
    price: z.number().optional(),
    qty: z.number(),
    category: z.string().optional(),
    brand: z.string().optional(),
    other: z.record(z.string(), z.unknown()).optional(),
    deleted_at: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
})

export type Product = z.infer<typeof ProductSchema>

export const ProductInsertSchema = ProductSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
})
export type ProductInsert = z.infer<typeof ProductInsertSchema>

export type Products = Product[]

export type ProductsResult = {
    success: boolean
    products: Product[]
    canManage: boolean
    error?: string
}
