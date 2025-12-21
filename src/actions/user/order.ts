'use server'

import { logWarning, withErrorHandling } from '@/lib/utils'
import { createClient } from '@/supabase/server'
import { CreateTransactionType, Order } from '@/types/orders'

import { authorize, can } from '../authorize'
import { revalidateSellerProducts, revalidateSellerRecent, revalidateSellerTop } from '../revalidate'

const seller = withErrorHandling(async () => {
    const supabase = await createClient()
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) return null

    const { data, error } = await supabase
        .from('users')
        .select('id, phone, name, username, address')
        .eq('id', user.id)
        .single()

    if (error) {
        logWarning('Error fetching seller data:', error)

        return null
    }

    return data
})

type CreateOrderInput = {
    order: Order
}

export const createOrder = withErrorHandling(async ({ order }: CreateOrderInput) => {
    const supabase = await createClient()

    const canCreateOrder = await authorize(can.create.order)

    if (!canCreateOrder) {
        throw new Error('You do not have permission to create an order')
    }

    const sellerData = await seller()

    if (!sellerData) {
        throw new Error('Unable to fetch seller data')
    }

    const orderData = {
        userName: order.userName,
        userPhone: order.userPhone,
        userAddress: order.userAddress || {},
        sellerID: sellerData.id,
        sellerName: sellerData.name,
        sellerUserName: sellerData.username,
        sellerPhone: sellerData.phone,
        sellerAddress: sellerData.address || null,
        totalAmount: order.totalAmount,
        paid: order.paid || 0,
        mode: order.mode,
        note: order.note || null,
    }

    const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

    if (orderError) {
        logWarning('Error creating order:', orderError)
        throw new Error(`Failed to create order: ${orderError.message}`)
    }

    const orderId = orderResult.id

    const orderProductsData = order.products.map((product) => ({
        order_id: orderId,
        product_id: product.productID,
        name: product.name,
        category: product.category || null,
        image: product.image || null,
        brand: product.brand || null,
        color: product.color || null,
        storage: product.storage || null,
        serial: product.serial || null,
        price: product.price,
        purchase_price: product.purchasePrice,
        quantity: product.quantity,
        returned_quantity: product.returnedQuantity || 0,
    }))

    const { error: productsError } = await supabase.from('order_products').insert(orderProductsData)

    if (productsError) {
        logWarning('Error creating order products:', productsError)
        throw new Error(`Failed to create order products: ${productsError.message}`)
    }

    await revalidateSellerRecent(sellerData.username)
    await revalidateSellerTop(sellerData.username)
    await revalidateSellerProducts(sellerData.username)

    return { success: true, orderId }
})

export const userTransactions = withErrorHandling(async (userPhone: number) => {
    const supabase = await createClient()
    const sellerData = await seller()

    if (!sellerData) throw new Error('Seller not found')

    const { data, error } = await supabase.rpc('get_user_transactions', {
        p_seller_id: sellerData.id,
        p_user_phone: userPhone.toString(),
    })

    if (error) throw error

    // Optionally normalize output
    return data
})

export const CreateTransaction = withErrorHandling(async (add: CreateTransactionType) => {
    if (!add.userPhone || !add.amount || !add.type) {
        throw new Error('Missing required transaction fields')
    }

    const supabase = await createClient()

    const { data, error } = await supabase.rpc('add_transaction_secure', {
        p_user_phone: add.userPhone.toString(),
        p_amount: add.amount,
        p_type: add.type,
        p_mode: add.mode ?? null,
        p_notes: add.notes ?? null,
    })

    if (error) throw new Error(error.message)

    return data
})
