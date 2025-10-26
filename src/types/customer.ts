import z from 'zod'

export const Address = {
    city: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    pincode: z.number().optional(),
    country: z.string().optional(),
}

export const CustomerSchema = z.object({
    id: z.number().or(z.string()).optional(),
    phone: z.string().min(1, 'Phone is required'),
    name: z.string().min(1, 'Name is required'),
    address: z.object(Address).optional().nullable(),
    avatar: z.string().optional(),
    gender: z.string().optional(),
})

export type CustomerInput = z.infer<typeof CustomerSchema>
