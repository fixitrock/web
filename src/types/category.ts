export type Category = {
    id: string
    name: string
    keywords: string[]
    description: string
    image: string
    created_at: string
    updated_at: string
}
export type CategoryInput = {
    name: string
    keywords: string[]
    description: string
    imageUrl?: string
}
export type Categories = Category[]
