import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { Order } from '@/types/orders'

export const generateInvoicePDF = (order: Order) => {
    const doc = new jsPDF()

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return `Rs. ${new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)}`
    }

    // Helper to format address
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

    // --- Header ---
    doc.setFontSize(20)
    doc.text('INVOICE', 14, 22)

    doc.setFontSize(10)
    doc.text(`Order #${order.id}`, 196, 20, { align: 'right' })
    doc.text(
        `Date: ${order.createdAt ? format(new Date(order.createdAt), 'MMMM dd, yyyy') : 'N/A'}`,
        196,
        26,
        { align: 'right' }
    )

    doc.line(14, 32, 196, 32)

    // --- Parties ---
    let yPos = 45

    // Billed From
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text('BILLED FROM', 14, yPos)
    doc.setTextColor(0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(order.sellerName || 'Store Name', 14, yPos + 6)
    doc.setFont('helvetica', 'normal')
    doc.text(order.sellerPhone || '', 14, yPos + 11)
    if (order.sellerAddress) {
        const sellerAddr = [order.sellerAddress.city, order.sellerAddress.state]
            .filter(Boolean)
            .join(', ')
        doc.text(sellerAddr, 14, yPos + 16)
    }
    if (order.sellerGSTIN) {
        doc.text(`GSTIN: ${order.sellerGSTIN}`, 14, yPos + 21)
    }

    // Billed To
    doc.setFontSize(9)
    doc.setTextColor(150)
    doc.text('BILLED TO', 110, yPos)
    doc.setTextColor(0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(order.userName, 110, yPos + 6)
    doc.setFont('helvetica', 'normal')
    doc.text(order.userPhone, 110, yPos + 11)

    // Handle address wrapping if needed, but for now simple text
    const userAddr = formatAddress(order.userAddress)
    const splitUserAddr = doc.splitTextToSize(userAddr, 80)
    doc.text(splitUserAddr, 110, yPos + 16)

    // --- Table ---
    const tableRows = order.products.map((product) => {
        const qty = product.quantity - product.returnedQuantity
        const total = product.price * qty
        return [
            product.name,
            qty,
            formatCurrency(product.price),
            formatCurrency(total),
        ]
    })

    autoTable(doc, {
        startY: yPos + 35,
        head: [['ITEM', 'QTY', 'PRICE', 'TOTAL']],
        body: tableRows,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [0, 0, 0],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Item
            1: { cellWidth: 20, halign: 'center' }, // Qty
            2: { cellWidth: 30, halign: 'right' }, // Price
            3: { cellWidth: 30, halign: 'right' }, // Total
        },
        foot: [
            [
                { content: 'TOTAL AMOUNT', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
                { content: formatCurrency(order.totalAmount), styles: { halign: 'right', fontStyle: 'bold', fontSize: 12 } },
            ],
        ],
    })

    // --- Footer ---
    const finalY = (doc as any).lastAutoTable.finalY || 200

    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Thank you for your business', 14, finalY + 20)
    doc.text('Authorized Signature', 196, finalY + 20, { align: 'right' })

    // Save the PDF
    doc.save(`invoice-${order.id}.pdf`)
}
