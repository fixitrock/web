'use client'

import type { ReactNode } from 'react'

import Image from 'next/image'
import { format } from 'date-fns'
import {
    Calendar,
    CreditCard,
    Download,
    FileText,
    MapPin,
    Package,
    Phone,
    Share2,
} from 'lucide-react'
import { Button, Card, Chip, ScrollShadow, Separator, Tooltip } from '@heroui/react'
import { Snippet } from '@heroui/snippet'
import { User } from '@heroui/user'

import { fallback } from '@/config/site'
import { bucketUrl } from '@/supabase/bucket'
import { Order } from '@/types/orders'
import { UserIcon } from '@/ui/icons'

interface OrderDetailsProps {
    order: Order
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount)
}

function formatAddress(address: Order['userAddress']) {
    if (!address) return 'N/A'

    const parts = [address.city, address.district, address.state, address.pinCode, address.country].filter(Boolean)
    return parts.join(', ') || 'N/A'
}

function getPaymentStatus(paid: number, total: number) {
    if (paid >= total) return { label: 'Paid', color: 'success' as const }
    if (paid > 0) return { label: 'Partial', color: 'warning' as const }
    return { label: 'Unpaid', color: 'danger' as const }
}

function ActionIconButton({
    tooltip,
    children,
    onPress,
}: {
    tooltip: string
    children: ReactNode
    onPress?: () => void
}) {
    return (
        <Tooltip>
            <Tooltip.Trigger>
                <Button isIconOnly size='sm' variant='tertiary' onPress={onPress}>
                    {children}
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content placement='top' showArrow>
                <Tooltip.Arrow />
                <p>{tooltip}</p>
            </Tooltip.Content>
        </Tooltip>
    )
}

export function OrderDetails({ order }: OrderDetailsProps) {
    const paymentStatus = getPaymentStatus(order.paid || 0, order.totalAmount)
    const totalItems = order.products.reduce((sum, product) => sum + product.quantity, 0)
    const totalReturned = order.products.reduce((sum, product) => sum + product.returnedQuantity, 0)

    const shareOnWhatsApp = () => {
        const itemsList = order.products
            .map(
                (product) =>
                    `- ${product.name} x${product.quantity} - ${formatCurrency(product.price * product.quantity)}`
            )
            .join('\n')

        const text = [
            `*INVOICE #${order.id}*`,
            order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : 'N/A',
            '',
            '*Customer Details*',
            order.userName,
            order.userPhone,
            '',
            '*Order Summary*',
            itemsList,
            '',
            `Total Amount: ${formatCurrency(order.totalAmount)}`,
            '',
            'Thank you for shopping with us!',
        ].join('\n')
        const url = `https://wa.me/${order.userPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`

        window.open(url, '_blank')
    }

    return (
        <div className='space-y-6 p-1'>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                        <h2 className='text-lg font-bold'>Order ID</h2>
                        <Snippet
                            className='bg-default-100 text-default-900 font-mono text-sm'
                            codeString={order.id || ''}
                            size='sm'
                            symbol='#'
                            variant='flat'
                        >
                            {order.id}
                        </Snippet>
                    </div>
                    <div className='text-small text-default-500 flex items-center gap-2'>
                        <Calendar className='h-3.5 w-3.5' />
                        <span>{order.createdAt ? format(new Date(order.createdAt), 'PPP p') : 'N/A'}</span>
                    </div>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                    <ActionIconButton tooltip='Download PDF Invoice'>
                        <Download size={18} />
                    </ActionIconButton>
                    <ActionIconButton tooltip='Share on WhatsApp' onPress={shareOnWhatsApp}>
                        <Share2 size={18} />
                    </ActionIconButton>
                    <div className='bg-default-300 mx-1 h-6 w-px' />
                    <Chip color={paymentStatus.color} variant='soft'>
                        <Chip.Label>{paymentStatus.label}</Chip.Label>
                    </Chip>
                    <Chip color='default' variant='soft'>
                        <Chip.Label>{order.mode || 'Unknown Mode'}</Chip.Label>
                    </Chip>
                </div>
            </div>

            <Separator />

            <div className='grid gap-4 md:grid-cols-2'>
                <Card className='bg-content1 border-default-200 border shadow-sm'>
                    <Card.Header className='flex gap-3 pb-2'>
                        <div className='bg-primary/10 text-primary rounded-lg p-2'>
                            <UserIcon className='h-5 w-5' />
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-md font-semibold'>Customer Details</p>
                            <p className='text-small text-default-500'>Contact information</p>
                        </div>
                    </Card.Header>
                    <Separator />
                    <Card.Content className='gap-4 p-4'>
                        <User
                            avatarProps={{
                                className: 'bg-primary/10 text-primary font-bold',
                                radius: 'lg',
                                src: `https://avatar.vercel.sh/${order.userName}`,
                            }}
                            className='justify-start'
                            description={
                                <div className='text-default-500 flex items-center gap-1'>
                                    <Phone className='h-3 w-3' />
                                    {order.userPhone}
                                </div>
                            }
                            name={order.userName}
                        />
                        <div className='bg-default-50 rounded-large flex items-start gap-3 p-3'>
                            <MapPin className='text-default-500 mt-0.5 h-4 w-4 shrink-0' />
                            <div className='flex flex-col'>
                                <span className='text-default-500 mb-0.5 text-xs font-medium uppercase'>
                                    Shipping Address
                                </span>
                                <span className='text-small text-default-700 leading-relaxed'>
                                    {formatAddress(order.userAddress)}
                                </span>
                            </div>
                        </div>
                    </Card.Content>
                </Card>

                <Card className='bg-content1 border-default-200 border shadow-sm'>
                    <Card.Header className='flex gap-3 pb-2'>
                        <div className='bg-success/10 text-success rounded-lg p-2'>
                            <CreditCard className='h-5 w-5' />
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-md font-semibold'>Payment Summary</p>
                            <p className='text-small text-default-500'>Financial details</p>
                        </div>
                    </Card.Header>
                    <Separator />
                    <Card.Content className='gap-3 p-4'>
                        <div className='hover:bg-default-50 flex items-center justify-between rounded-lg p-2 transition-colors'>
                            <span className='text-small text-default-500'>Total Amount</span>
                            <span className='text-large font-bold'>{formatCurrency(order.totalAmount)}</span>
                        </div>
                        <div className='hover:bg-default-50 flex items-center justify-between rounded-lg p-2 transition-colors'>
                            <span className='text-small text-default-500'>Paid Amount</span>
                            <span className='text-medium text-success font-semibold'>
                                {formatCurrency(order.paid || 0)}
                            </span>
                        </div>
                        <Separator className='my-1' />
                        <div className='bg-danger/5 border-danger/10 flex items-center justify-between rounded-lg border p-2'>
                            <span className='text-small text-danger font-medium'>Balance Due</span>
                            <span className='text-large text-danger font-bold'>
                                {formatCurrency(order.totalAmount - (order.paid || 0))}
                            </span>
                        </div>
                    </Card.Content>
                </Card>
            </div>

            <Card className='border-default-200 border shadow-sm'>
                <Card.Header className='flex items-center justify-between px-4 py-3'>
                    <div className='flex items-center gap-2'>
                        <Package className='text-default-500 h-5 w-5' />
                        <span className='font-semibold'>Order Items</span>
                    </div>
                    <Chip color='accent' size='sm' variant='soft'>
                        <Chip.Label>
                            {totalItems} Items {totalReturned > 0 ? `(${totalReturned} Returned)` : ''}
                        </Chip.Label>
                    </Chip>
                </Card.Header>
                <Separator />
                <Card.Content className='overflow-hidden p-0'>
                    <ScrollShadow className='max-h-100 w-full'>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead className='bg-default-50 text-default-500'>
                                    <tr>
                                        <th className='h-10 px-4 text-left font-medium'>PRODUCT</th>
                                        <th className='h-10 px-4 text-left font-medium'>ATTRIBUTES</th>
                                        <th className='h-10 px-4 text-left font-medium'>PRICE</th>
                                        <th className='h-10 px-4 text-center font-medium'>QTY</th>
                                        <th className='h-10 px-4 text-center font-medium'>RETURNED</th>
                                        <th className='h-10 px-4 text-right font-medium'>SUBTOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.products.map((product, index) => (
                                        <tr key={`${product.id || product.name}-${index}`} className='border-default-100 border-b last:border-0'>
                                            <td className='px-4 py-3'>
                                                <div className='flex items-center gap-3'>
                                                    <Image
                                                        alt={product.name}
                                                        className='border-default-200 h-12 w-12 rounded-lg border object-cover'
                                                        height={48}
                                                        src={product.image ? bucketUrl(product.image) : fallback.order}
                                                        width={48}
                                                    />
                                                    <div className='flex flex-col'>
                                                        <span className='text-small line-clamp-1 font-medium'>
                                                            {product.name}
                                                        </span>
                                                        <span className='text-tiny text-default-400'>
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='px-4 py-3'>
                                                <div className='flex max-w-37.5 flex-wrap gap-1'>
                                                    {product.brand ? (
                                                        <Chip size='sm' variant='soft'>
                                                            <Chip.Label>{product.brand}</Chip.Label>
                                                        </Chip>
                                                    ) : null}
                                                    {product.storage ? (
                                                        <Chip size='sm' variant='soft'>
                                                            <Chip.Label>{product.storage}</Chip.Label>
                                                        </Chip>
                                                    ) : null}
                                                    {product.color ? (
                                                        <div className='bg-default-100 border-default-200 flex items-center gap-1 rounded-full border px-1.5 py-0.5'>
                                                            <div
                                                                className='ring-default-300 h-2 w-2 rounded-full ring-1'
                                                                style={{ backgroundColor: product.color.hex }}
                                                            />
                                                            <span className='text-[10px] font-medium'>
                                                                {product.color.name}
                                                            </span>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className='px-4 py-3'>
                                                <span className='text-small text-default-600 font-mono'>
                                                    {formatCurrency(product.price)}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3 text-center'>
                                                <Chip size='sm' variant='soft'>
                                                    <Chip.Label>{product.quantity}</Chip.Label>
                                                </Chip>
                                            </td>
                                            <td className='px-4 py-3 text-center'>
                                                {product.returnedQuantity > 0 ? (
                                                    <Chip color='danger' size='sm' variant='soft'>
                                                        <Chip.Label>{product.returnedQuantity}</Chip.Label>
                                                    </Chip>
                                                ) : (
                                                    <span className='text-default-300'>-</span>
                                                )}
                                            </td>
                                            <td className='px-4 py-3 text-right'>
                                                <div className='text-small font-semibold'>
                                                    {formatCurrency(product.price * (product.quantity - product.returnedQuantity))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ScrollShadow>
                </Card.Content>
            </Card>

            {order.note ? (
                <Card className='bg-warning/5 border-warning/20 border shadow-sm'>
                    <Card.Content className='flex flex-row items-start gap-3 p-4'>
                        <FileText className='text-warning-600 mt-0.5 h-5 w-5' />
                        <div className='flex flex-col gap-1'>
                            <span className='text-small text-warning-700 font-semibold'>Order Notes</span>
                            <p className='text-small text-warning-800 leading-relaxed'>{order.note}</p>
                        </div>
                    </Card.Content>
                </Card>
            ) : null}
        </div>
    )
}
