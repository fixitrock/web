import { ImageResponse } from 'next/og'

import { getOrderShare } from '@/actions/public/ordershare'

const formatMoney = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })

    return formatter.format(amount).replace('₹', 'Rs.')
}

export const revalidate = 60

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')?.trim()

    if (!key) {
        return new Response('Missing key', { status: 400 })
    }

    const data = await getOrderShare(key)

    if (!data?.order) {
        return new Response('Order not found', { status: 404 })
    }

    const order = data.order as Record<string, unknown>
    const products = (data.products ?? []) as Record<string, unknown>[]

    const totalAmount = Number(order.totalAmount ?? 0)
    const totalItems = products.reduce((sum, product) => {
        const qty = Number(product.quantity ?? 0)
        return sum + (Number.isNaN(qty) ? 0 : qty)
    }, 0)

    const createdAt = order.createdAt ? new Date(order.createdAt as string) : null
    const orderId = String(order.id ?? '')
    const sellerName = String(order.sellerName ?? 'Seller')
    const customerName = String(order.userName ?? 'Customer')

    const items = products.slice(0, 6).map((product) => {
        const name = String(product.name ?? '')
        const qty = Number(product.quantity ?? 0)
        const price = Number(product.price ?? 0)
        const lineTotal = qty * price

        const brand = String(product.brand ?? '')
        const storage = String(product.storage ?? '')
        const colorName =
            typeof product.color === 'object' && product.color
                ? String((product.color as { name?: string }).name ?? '')
                : ''

        const metaParts = [brand, colorName, storage].filter(Boolean)

        return {
            name,
            qty,
            lineTotal,
            meta: metaParts.join(' • '),
        }
    })

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background:
                        'radial-gradient(circle at 20% 15%, rgba(99, 102, 241, 0.2), rgba(15, 23, 42, 0) 45%), linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #0b1220 100%)',
                    padding: 24,
                    fontFamily: 'sans-serif',
                    color: '#0f172a',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#ffffff',
                        borderRadius: 24,
                        padding: 42,
                        boxShadow: '0 28px 90px rgba(2, 6, 23, 0.35)',
                        border: '1px solid #e5e7eb',
                        gap: 20,
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: 6,
                            borderTopLeftRadius: 24,
                            borderBottomLeftRadius: 24,
                            background: 'linear-gradient(180deg, #2563eb 0%, #9333ea 100%)',
                        }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: 11,
                                    letterSpacing: 3.2,
                                    textTransform: 'uppercase',
                                    color: '#6b7280',
                                }}
                            >
                                Customer
                            </div>
                            <div style={{ display: 'flex', fontSize: 36, fontWeight: 700 }}>
                                {customerName}
                            </div>
                            <div style={{ display: 'flex', fontSize: 13, color: '#6b7280' }}>
                                {String(order.userPhone ?? '')}
                            </div>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                gap: 6,
                                background: '#0f172a',
                                color: '#f8fafc',
                                padding: '14px 18px',
                                borderRadius: 16,
                                minWidth: 240,
                            }}
                        >
                            <div style={{ display: 'flex', fontSize: 11, color: '#cbd5f5' }}>
                                Order ID
                            </div>
                            <div style={{ display: 'flex', fontSize: 22, fontWeight: 700 }}>
                                #{orderId.slice(-6).toUpperCase()}
                            </div>
                            <div style={{ display: 'flex', fontSize: 11, color: '#cbd5f5' }}>
                                {createdAt ? createdAt.toLocaleString('en-IN') : 'Date unavailable'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', fontSize: 11, color: '#6b7280' }}>
                                Payment
                            </div>
                            <div style={{ display: 'flex', fontSize: 14, fontWeight: 700 }}>
                                {String(order.mode ?? 'N/A').toUpperCase()}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', fontSize: 11, color: '#6b7280' }}>
                                Items
                            </div>
                            <div style={{ display: 'flex', fontSize: 14, fontWeight: 700 }}>
                                {totalItems}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', fontSize: 11, color: '#6b7280' }}>
                                Total
                            </div>
                            <div style={{ display: 'flex', fontSize: 16, fontWeight: 700 }}>
                                {formatMoney(totalAmount)}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 11,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 1.5,
                                borderBottom: '1px solid #e5e7eb',
                                paddingBottom: 8,
                            }}
                        >
                            <div style={{ display: 'flex' }}>Item</div>
                            <div style={{ display: 'flex' }}>Total</div>
                        </div>
                        {items.map((item, idx) => {
                            return (
                                <div
                                    key={`${item.name}-${idx}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 16,
                                        color: '#0f172a',
                                        borderBottom: '1px dashed #f1f5f9',
                                        paddingBottom: 8,
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{ display: 'flex', fontWeight: 600 }}>
                                            {item.name} x{item.qty}
                                        </div>
                                        {item.meta ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    fontSize: 12,
                                                    color: '#6b7280',
                                                }}
                                            >
                                                {item.meta}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div style={{ display: 'flex', fontWeight: 600 }}>
                                        {formatMoney(item.lineTotal)}
                                    </div>
                                </div>
                            )
                        })}
                        {products.length > 6 && (
                            <div style={{ display: 'flex', fontSize: 12, color: '#6b7280' }}>
                                +{products.length - 6} more items
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            borderTop: '1px solid #e5e7eb',
                            paddingTop: 14,
                            color: '#6b7280',
                            fontSize: 12,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex' }}>Thank you for your purchase.</div>
                            <div style={{ display: 'flex', fontWeight: 600 }}>
                                Issued by {sellerName || 'Seller'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            Powered by Fix iT Rock
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
            headers: {
                'Cache-Control': 'public, max-age=60, s-maxage=60',
            },
        }
    )
}
