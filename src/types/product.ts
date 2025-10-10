import { z } from 'zod'

export const ColorInfoSchema = z.object({
    name: z.string(),
    code: z.string().nullable().optional(),
})

export const ProductVariantSchema = z.object({
    id: z.number(),
    product_id: z.number(),
    color: ColorInfoSchema.nullable().optional(),
    storage: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    purchase: z.number(),
    staff_price: z.number(),
    price: z.number(),
    mrp: z.number(),
    qty: z.number(),
    img: z.array(z.string()),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable(),
})

export const ProductSchema = z.object({
    id: z.number(),
    user_id: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    compatible: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    brand: z.string().nullable().optional(),
    color: ColorInfoSchema.nullable().optional(),
    storage: z.string().nullable().optional(),
    img: z.array(z.string()),
    purchase: z.number(),
    staff_price: z.number(),
    price: z.number(),
    mrp: z.number(),
    qty: z.number(),
    variants_cache: z
        .array(ProductVariantSchema.omit({ product_id: true }))
        .nullable()
        .optional(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable(),
})

export type ColorInfo = z.infer<typeof ColorInfoSchema>
export type ProductVariant = z.infer<typeof ProductVariantSchema>
export type Product = z.infer<typeof ProductSchema>
export type Products = Product[]
