'use client'

import { Order } from '@/types/orders'
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    User,
    Snippet,
    Image,
    ScrollShadow,
    Button,
    Tooltip,
} from '@heroui/react'
import { format } from 'date-fns'
import {
    MapPin,
    Phone,
    CreditCard,
    Calendar,
    FileText,
    Package,
    Download,
    Share2,
} from 'lucide-react'
import { bucketUrl } from '@/supabase/bucket'
import { fallback } from '@/config/site'
// import { generateInvoicePDF } from './invoice-pdf'
import { UserIcon } from '@/ui/icons'

interface OrderDetailsProps {
    order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const formatAddress = (address: Order['userAddress']) => {
        if (!address) return 'N/A'
        const parts = [
            address.city,
            address.district,
            address.state,
            address.pinCode,
            address.country,
        ].filter(Boolean)
        return parts.join(', ') || 'N/A'
    }

    const getPaymentStatus = (paid: number, total: number) => {
        if (paid >= total) return { label: 'Paid', color: 'success' as const }
        if (paid > 0) return { label: 'Partial', color: 'warning' as const }
        return { label: 'Unpaid', color: 'danger' as const }
    }

    const paymentStatus = getPaymentStatus(order.paid || 0, order.totalAmount)
    const totalItems = order.products.reduce((sum, p) => sum + p.quantity, 0)
    const totalReturned = order.products.reduce((sum, p) => sum + p.returnedQuantity, 0)

    // const generatePDF = () => {
    //     try {
    //         generateInvoicePDF(order)
    //     } catch (error) {
    //         console.error('Error generating PDF:', error)
    //         alert('Failed to generate PDF. Please try again.')
    //     }
    // }

    const shareOnWhatsApp = () => {
        const itemsList = order.products
            .map((p) => `• ${p.name} x${p.quantity} - ${formatCurrency(p.price * p.quantity)}`)
            .join('\n')

        const text = `*INVOICE #${order.id}*
📅 ${order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : 'N/A'}

*Customer Details*
👤 ${order.userName}
📞 ${order.userPhone}

*Order Summary*
${itemsList}

--------------------------------
*Total Amount:* ${formatCurrency(order.totalAmount)}
--------------------------------

Thank you for shopping with us!
_Please find the detailed invoice attached (if sent manually) or contact us for the PDF._`

        const url = `https://wa.me/${order.userPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    return (
        <div className='space-y-6 p-1'>
            {/* Header Section */}
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                        <h2 className='text-lg font-bold'>Order ID</h2>
                        <Snippet
                            symbol='#'
                            codeString={order.id || ''}
                            className='bg-default-100 text-default-900 font-mono text-sm'
                            variant='flat'
                            size='sm'
                        >
                            {order.id}
                        </Snippet>
                    </div>
                    <div className='text-small text-default-500 flex items-center gap-2'>
                        <Calendar className='h-3.5 w-3.5' />
                        <span>{order.createdAt && format(new Date(order.createdAt), 'PPP p')}</span>
                    </div>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                    <Tooltip content='Download PDF Invoice'>
                        <Button
                            isIconOnly
                            variant='flat'
                            color='primary'
                            size='sm'
                            // onPress={generatePDF}
                        >
                            <Download size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip content='Share on WhatsApp'>
                        <Button
                            isIconOnly
                            variant='flat'
                            color='success'
                            size='sm'
                            onPress={shareOnWhatsApp}
                        >
                            <Share2 size={18} />
                        </Button>
                    </Tooltip>
                    <div className='bg-default-300 mx-1 h-6 w-px' />
                    <Chip
                        color={paymentStatus.color}
                        variant='flat'
                        className='font-medium capitalize'
                    >
                        {paymentStatus.label}
                    </Chip>
                    <Chip variant='dot' className='border-default-200 capitalize'>
                        {order.mode || 'Unknown Mode'}
                    </Chip>
                </div>
            </div>

            <Divider />

            {/* Info Grid */}
            <div className='grid gap-4 md:grid-cols-2'>
                {/* Customer Info */}
                <Card className='bg-content1 border-default-200 border shadow-sm'>
                    <CardHeader className='flex gap-3 pb-2'>
                        <div className='bg-primary/10 text-primary rounded-lg p-2'>
                            <UserIcon className='h-5 w-5' />
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-md font-semibold'>Customer Details</p>
                            <p className='text-small text-default-500'>Contact information</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className='gap-4'>
                        <User
                            name={order.userName}
                            description={
                                <div className='text-default-500 flex items-center gap-1'>
                                    <Phone className='h-3 w-3' />
                                    {order.userPhone}
                                </div>
                            }
                            avatarProps={{
                                src: `https://avatar.vercel.sh/${order.userName}`,
                                radius: 'lg',
                                className: 'bg-primary/10 text-primary font-bold',
                            }}
                            className='justify-start'
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
                    </CardBody>
                </Card>

                {/* Payment Info */}
                <Card className='bg-content1 border-default-200 border shadow-sm'>
                    <CardHeader className='flex gap-3 pb-2'>
                        <div className='bg-success/10 text-success rounded-lg p-2'>
                            <CreditCard className='h-5 w-5' />
                        </div>
                        <div className='flex flex-col'>
                            <p className='text-md font-semibold'>Payment Summary</p>
                            <p className='text-small text-default-500'>Financial details</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className='gap-3'>
                        <div className='hover:bg-default-50 flex items-center justify-between rounded-lg p-2 transition-colors'>
                            <span className='text-small text-default-500'>Total Amount</span>
                            <span className='text-large font-bold'>
                                {formatCurrency(order.totalAmount)}
                            </span>
                        </div>
                        <div className='hover:bg-default-50 flex items-center justify-between rounded-lg p-2 transition-colors'>
                            <span className='text-small text-default-500'>Paid Amount</span>
                            <span className='text-medium text-success font-semibold'>
                                {formatCurrency(order.paid || 0)}
                            </span>
                        </div>
                        <Divider className='my-1' />
                        <div className='bg-danger/5 border-danger/10 flex items-center justify-between rounded-lg border p-2'>
                            <span className='text-small text-danger font-medium'>Balance Due</span>
                            <span className='text-large text-danger font-bold'>
                                {formatCurrency(order.totalAmount - (order.paid || 0))}
                            </span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Order Items */}
            <Card className='border-default-200 border shadow-sm'>
                <CardHeader className='flex items-center justify-between px-4 py-3'>
                    <div className='flex items-center gap-2'>
                        <Package className='text-default-500 h-5 w-5' />
                        <span className='font-semibold'>Order Items</span>
                    </div>
                    <Chip size='sm' variant='flat' color='secondary'>
                        {totalItems} Items {totalReturned > 0 && `(${totalReturned} Returned)`}
                    </Chip>
                </CardHeader>
                <Divider />
                <CardBody className='overflow-hidden p-0'>
                    <ScrollShadow className='max-h-100 w-full'>
                        <Table
                            removeWrapper
                            aria-label='Order items table'
                            classNames={{
                                th: 'bg-default-50 text-default-500 h-10 font-medium',
                                td: 'py-3',
                            }}
                        >
                            <TableHeader>
                                <TableColumn>PRODUCT</TableColumn>
                                <TableColumn>ATTRIBUTES</TableColumn>
                                <TableColumn>PRICE</TableColumn>
                                <TableColumn align='center'>QTY</TableColumn>
                                <TableColumn align='center'>RETURNED</TableColumn>
                                <TableColumn align='end'>SUBTOTAL</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {order.products.map((product, idx) => (
                                    <TableRow
                                        key={idx}
                                        className='border-default-100 border-b last:border-0'
                                    >
                                        <TableCell>
                                            <div className='flex items-center gap-3'>
                                                <div className='relative shrink-0'>
                                                    <Image
                                                        src={
                                                            product.image
                                                                ? bucketUrl(product.image)
                                                                : fallback.order
                                                        }
                                                        alt={product.name}
                                                        className='border-default-200 h-12 w-12 rounded-lg border object-cover'
                                                        width={48}
                                                        height={48}
                                                    />
                                                </div>
                                                <div className='flex flex-col'>
                                                    <span className='text-small line-clamp-1 font-medium'>
                                                        {product.name}
                                                    </span>
                                                    <span className='text-tiny text-default-400'>
                                                        {product.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex max-w-37.5 flex-wrap gap-1'>
                                                {product.brand && (
                                                    <Chip
                                                        size='sm'
                                                        variant='flat'
                                                        className='h-5 px-1 text-[10px]'
                                                    >
                                                        {product.brand}
                                                    </Chip>
                                                )}
                                                {product.storage && (
                                                    <Chip
                                                        size='sm'
                                                        variant='flat'
                                                        className='h-5 px-1 text-[10px]'
                                                    >
                                                        {product.storage}
                                                    </Chip>
                                                )}
                                                {product.color && (
                                                    <div className='bg-default-100 border-default-200 flex items-center gap-1 rounded-full border px-1.5 py-0.5'>
                                                        <div
                                                            className='ring-default-300 h-2 w-2 rounded-full ring-1'
                                                            style={{
                                                                backgroundColor: product.color.hex,
                                                            }}
                                                        />
                                                        <span className='text-[10px] font-medium'>
                                                            {product.color.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className='text-small text-default-600 font-mono'>
                                                {formatCurrency(product.price)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex justify-center'>
                                                <Chip
                                                    size='sm'
                                                    variant='flat'
                                                    className='font-mono'
                                                >
                                                    {product.quantity}
                                                </Chip>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex justify-center'>
                                                {product.returnedQuantity > 0 ? (
                                                    <Chip
                                                        size='sm'
                                                        color='danger'
                                                        variant='flat'
                                                        className='font-mono'
                                                    >
                                                        {product.returnedQuantity}
                                                    </Chip>
                                                ) : (
                                                    <span className='text-default-300'>-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className='text-small text-right font-semibold'>
                                                {formatCurrency(
                                                    product.price *
                                                        (product.quantity -
                                                            product.returnedQuantity)
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollShadow>
                </CardBody>
            </Card>

            {/* Notes */}
            {order.note && (
                <Card className='bg-warning/5 border-warning/20 border shadow-sm'>
                    <CardBody className='flex flex-row items-start gap-3 p-4'>
                        <FileText className='text-warning-600 mt-0.5 h-5 w-5' />
                        <div className='flex flex-col gap-1'>
                            <span className='text-small text-warning-700 font-semibold'>
                                Order Notes
                            </span>
                            <p className='text-small text-warning-800 leading-relaxed'>
                                {order.note}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    )
}
