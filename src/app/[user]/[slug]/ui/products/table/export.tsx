'use client'

import { useState } from 'react'
import { Button, Badge } from '@heroui/react'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable, { RowInput } from 'jspdf-autotable'

import { Product } from '@/types/product'
import { formatNumber } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/tanstack/query'
import { siteConfig } from '@/config/site'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { PDFIcon } from '@/ui/icons'

interface ExportButtonProps {
    selectedProducts: Set<string>
    products: Product[]
}

export default function ExportButton({ selectedProducts, products }: ExportButtonProps) {
    const [open, setOpen] = useState(false)
    const { data } = useCurrentUser()

    const filteredProducts = products
        .filter((product) => selectedProducts.has(product.id.toString()))
        .sort((a, b) => (a.category || '').localeCompare(b.category || ''))

    if (filteredProducts.length === 0) return null

    const exportToPDF = async () => {
        const doc = new jsPDF()

        const headers = ['', 'Product', 'Category', 'Purchase', 'QTY', '']

        const body: RowInput[] = filteredProducts.map((product) => [
            '',
            product.name,
            product.category || '',
            product.purchase.toString(),
            product.qty.toString(),
            '',
        ])

        let globalRowIndex = 0
        const totalRows = body.length

        autoTable(doc, {
            startY: 25, // initial table start Y, leaves some top margin
            head: [headers],
            body,
            theme: 'plain',
            styles: {
                fontSize: 10,
                textColor: 40,
                lineColor: [229, 229, 229],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [245, 245, 245],
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles: {
                0: { cellWidth: 12 },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { cellWidth: 15, halign: 'center' },
                5: { cellWidth: 12 },
            },
            margin: { top: 25 },
            didDrawPage: (dataTable) => {
                const pageNumber = doc.getNumberOfPages()
                const pageHeight = doc.internal.pageSize.getHeight()
                const rowsOnPage = dataTable.table.body.length
                const startRow = globalRowIndex + 1
                const endRow = globalRowIndex + rowsOnPage

                globalRowIndex += rowsOnPage

                const now = new Date()
                const dateStr = now.toLocaleDateString('en-GB')

                doc.setFont('helvetica', 'normal')
                doc.setFontSize(9)
                doc.setTextColor(80)
                doc.text(`Date: ${dateStr}`, 200, 8, { align: 'right' })

                doc.setFontSize(9)
                doc.setTextColor(120)
                doc.text(`Page ${pageNumber} of ${doc.getNumberOfPages()}`, 14, pageHeight - 8)
                doc.text(siteConfig.domain, 200, pageHeight - 8, { align: 'right' })

                doc.setTextColor(80)
                doc.text(`${startRow}-${endRow} of ${totalRows} items`, 105, pageHeight - 8, {
                    align: 'center',
                })
            },
        })

        const now = new Date()
        const fileDate = now.toLocaleString('en-GB').replace(/[/: ]/g, '-').replace(/,/, '')

        doc.save(`${data?.name || ''}-${fileDate}.pdf`)
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Badge
                    className='text-[10px]'
                    color='primary'
                    content={formatNumber(selectedProducts.size)}
                    shape='circle'
                >
                    <Button
                        isIconOnly
                        className='rounded-sm border'
                        radius='full'
                        size='sm'
                        startContent={<Download size={16} />}
                        variant='light'
                        onPress={() => setOpen(true)}
                    />
                </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' aria-label='Export options' sideOffset={25}>
                <DropdownMenuItem key='pdf' onClick={exportToPDF}>
                    <PDFIcon className='size-4' /> Export as PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
