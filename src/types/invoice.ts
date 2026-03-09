export type Invoice = {
    id: string
    number: number
    product: string
    seller: string
    location: string
    created_at: string
}

export type InvoiceProduct = {
    id: string
    invoice_id: string
    name: string
    compatibility: string
    category: string
    qty: number
    purchase_price: number
    price: number
    created_at: string
}

export type FRP = {
    id: number
    title: string
    img: string
    link: string
    count: number
    created_at: string
}

export type Repair = {
    id: number
    title: string
    img: string
    link: string
    count: number
    created_at: string
}

export type Category = {
    id: string
    name: string
    image_url: string
    created_at: string
}
