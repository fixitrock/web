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
import { generateInvoicePDF } from './invoice-pdf'
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

    const generatePDF = () => {
        try {
            generateInvoicePDF(order)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF. Please try again.')
        }
    }

    const shareOnWhatsApp = () => {
        const itemsList = order.products
            .map(p => `• ${p.name} x${p.quantity} - ${formatCurrency(p.price * p.quantity)}`)
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
                            symbol="#"
                            codeString={order.id || ''}
                            className="bg-default-100 text-default-900 font-mono text-sm"
                            variant="flat"
                            size="sm"
                        >
                            {order.id}
                        </Snippet>
                    </div>
                    <div className='flex items-center gap-2 text-small text-default-500'>
                        <Calendar className='h-3.5 w-3.5' />
                        <span>
                            {order.createdAt && format(new Date(order.createdAt), 'PPP p')}
                        </span>
                    </div>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                    <Tooltip content="Download PDF Invoice">
                        <Button
                            isIconOnly
                            variant="flat"
                            color="primary"
                            size="sm"
                            onPress={generatePDF}
                        >
                            <Download size={18} />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Share on WhatsApp">
                        <Button
                            isIconOnly
                            variant="flat"
                            color="success"
                            size="sm"
                            onPress={shareOnWhatsApp}
                        >
                            <Share2 size={18} />
                        </Button>
                    </Tooltip>
                    <div className="h-6 w-px bg-default-300 mx-1" />
                    <Chip
                        color={paymentStatus.color}
                        variant="flat"
                        className="capitalize font-medium"
                    >
                        {paymentStatus.label}
                    </Chip>
                    <Chip variant="dot" className="capitalize border-default-200">
                        {order.mode || 'Unknown Mode'}
                    </Chip>
                </div>
            </div>

            <Divider />

            {/* Info Grid */}
            <div className='grid gap-4 md:grid-cols-2'>
                {/* Customer Info */}
                <Card className="bg-content1 shadow-sm border-default-200 border">
                    <CardHeader className="flex gap-3 pb-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">Customer Details</p>
                            <p className="text-small text-default-500">Contact information</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="gap-4">
                        <User
                            name={order.userName}
                            description={
                                <div className="flex items-center gap-1 text-default-500">
                                    <Phone className="w-3 h-3" />
                                    {order.userPhone}
                                </div>
                            }
                            avatarProps={{
                                src: `https://avatar.vercel.sh/${order.userName}`,
                                radius: "lg",
                                className: "bg-primary/10 text-primary font-bold"
                            }}
                            className="justify-start"
                        />
                        <div className="flex items-start gap-3 p-3 bg-default-50 rounded-large">
                            <MapPin className="w-4 h-4 text-default-500 mt-0.5 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-default-500 uppercase mb-0.5">Shipping Address</span>
                                <span className="text-small text-default-700 leading-relaxed">
                                    {formatAddress(order.userAddress)}
                                </span>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Payment Info */}
                <Card className="bg-content1 shadow-sm border-default-200 border">
                    <CardHeader className="flex gap-3 pb-2">
                        <div className="p-2 bg-success/10 rounded-lg text-success">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">Payment Summary</p>
                            <p className="text-small text-default-500">Financial details</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="gap-3">
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-default-50 transition-colors">
                            <span className="text-small text-default-500">Total Amount</span>
                            <span className="text-large font-bold">{formatCurrency(order.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg hover:bg-default-50 transition-colors">
                            <span className="text-small text-default-500">Paid Amount</span>
                            <span className="text-medium font-semibold text-success">
                                {formatCurrency(order.paid || 0)}
                            </span>
                        </div>
                        <Divider className="my-1" />
                        <div className="flex justify-between items-center p-2 bg-danger/5 rounded-lg border border-danger/10">
                            <span className="text-small font-medium text-danger">Balance Due</span>
                            <span className="text-large font-bold text-danger">
                                {formatCurrency(order.totalAmount - (order.paid || 0))}
                            </span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Order Items */}
            <Card className="shadow-sm border-default-200 border">
                <CardHeader className="flex justify-between items-center px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-default-500" />
                        <span className="font-semibold">Order Items</span>
                    </div>
                    <Chip size="sm" variant="flat" color="secondary">
                        {totalItems} Items {totalReturned > 0 && `(${totalReturned} Returned)`}
                    </Chip>
                </CardHeader>
                <Divider />
                <CardBody className="p-0 overflow-hidden">
                    <ScrollShadow className="w-full max-h-[400px]">
                        <Table
                            removeWrapper
                            aria-label="Order items table"
                            classNames={{
                                th: "bg-default-50 text-default-500 font-medium h-10",
                                td: "py-3"
                            }}
                        >
                            <TableHeader>
                                <TableColumn>PRODUCT</TableColumn>
                                <TableColumn>ATTRIBUTES</TableColumn>
                                <TableColumn>PRICE</TableColumn>
                                <TableColumn align="center">QTY</TableColumn>
                                <TableColumn align="center">RETURNED</TableColumn>
                                <TableColumn align="end">SUBTOTAL</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {order.products.map((product, idx) => (
                                    <TableRow key={idx} className="border-b border-default-100 last:border-0">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="relative shrink-0">
                                                    <Image
                                                        src={product.image ? bucketUrl(product.image) : fallback.order}
                                                        alt={product.name}
                                                        className="w-12 h-12 rounded-lg object-cover border border-default-200"
                                                        width={48}
                                                        height={48}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-small font-medium line-clamp-1">{product.name}</span>
                                                    <span className="text-tiny text-default-400">{product.category}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {product.brand && (
                                                    <Chip size="sm" variant="flat" className="h-5 text-[10px] px-1">
                                                        {product.brand}
                                                    </Chip>
                                                )}
                                                {product.storage && (
                                                    <Chip size="sm" variant="flat" className="h-5 text-[10px] px-1">
                                                        {product.storage}
                                                    </Chip>
                                                )}
                                                {product.color && (
                                                    <div className="flex items-center gap-1 bg-default-100 rounded-full px-1.5 py-0.5 border border-default-200">
                                                        <div
                                                            className="w-2 h-2 rounded-full ring-1 ring-default-300"
                                                            style={{ backgroundColor: product.color.hex }}
                                                        />
                                                        <span className="text-[10px] font-medium">{product.color.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-small font-mono text-default-600">
                                                {formatCurrency(product.price)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                <Chip size="sm" variant="flat" className="font-mono">
                                                    {product.quantity}
                                                </Chip>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center">
                                                {product.returnedQuantity > 0 ? (
                                                    <Chip size="sm" color="danger" variant="flat" className="font-mono">
                                                        {product.returnedQuantity}
                                                    </Chip>
                                                ) : (
                                                    <span className="text-default-300">-</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-right font-semibold text-small">
                                                {formatCurrency(product.price * (product.quantity - product.returnedQuantity))}
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
                <Card className="bg-warning/5 border-warning/20 border shadow-sm">
                    <CardBody className="flex flex-row items-start gap-3 p-4">
                        <FileText className="w-5 h-5 text-warning-600 mt-0.5" />
                        <div className="flex flex-col gap-1">
                            <span className="text-small font-semibold text-warning-700">Order Notes</span>
                            <p className="text-small text-warning-800 leading-relaxed">
                                {order.note}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    )
}
