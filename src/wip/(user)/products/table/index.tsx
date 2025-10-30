'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button, Tooltip, useDisclosure, Navbar } from '@heroui/react'
import React from 'react'
import { Edit, Filter, PackageOpen, Plus, SearchX } from 'lucide-react'

import { Product, Products } from '@/types/products'
import { Brand } from '@/types/brands'
import { formatDateTime, formatPrice, getStockStatus } from '@/lib/utils'
import { Delete } from '@/ui/icons'
import { Badge } from '@/ui/badge'
import { useProductFilterStore } from '@/zustand/filter'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Checkbox } from '@/ui/checkbox'

import Quantity from '../quantity'
import DeleteProduct from '../delete'

import { StatsCard } from './stats'
import { TopContent } from './top'
import { BottomContent } from './bottom'

interface ProductsTableProps {
    products: Products
    canManage: boolean
    brand: Brand[]
}

export default function ProductsTable({ products, canManage, brand }: ProductsTableProps) {
    const [addProduct, setAddProduct] = useState<Product | null>(null)

    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const [searchTerm, setSearchTerm] = useState('')
    const { values: filterValues, getActiveFilters, reset } = useProductFilterStore()

    const {
        isOpen: isAddOpen,
        onOpen: onAddOpen,
        onClose: onAddClose,
    } = useDisclosure({ defaultOpen: false })
    const {
        isOpen: isEditOpen,
        onOpen: onEditOpen,
        onClose: onEditClose,
    } = useDisclosure({ defaultOpen: false })
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose,
    } = useDisclosure({ defaultOpen: false })

    const categories = useMemo<string[]>(() => {
        const uniqueCategories = [
            ...new Set(products.map((p) => p.category).filter((v): v is string => !!v)),
        ]

        return ['all', ...uniqueCategories]
    }, [products])

    const brands = useMemo<string[]>(() => {
        const uniqueBrands = [
            ...new Set(products.map((p) => p.brand).filter((v): v is string => !!v)),
        ]

        return ['all', ...uniqueBrands]
    }, [products])

    const status = [
        { key: 'in', label: 'In Stock' },
        { key: 'low', label: 'Low Stock' },
        { key: 'out', label: 'Sold Out' },
    ]

    const columns = [
        { key: 'select', label: '' },
        { key: 'product', label: 'Product' },
        { key: 'compatibility', label: 'Compatibility' },
        { key: 'purchase', label: 'Purchase' },
        { key: 'staff', label: 'Staff' },
        { key: 'price', label: 'Price' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'status', label: 'Status' },
        { key: 'total', label: 'Total' },
        { key: 'actions', label: 'Actions' },
        { key: 'created_at', label: 'Created At' },
        { key: 'updated_at', label: 'Updated At' },
    ]

    const filterableColumns = columns.filter(
        (column) =>
            column.key === 'purchase' ||
            column.key === 'staff' ||
            column.key === 'created_at' ||
            column.key === 'updated_at'
    )

    const activeFilters = useMemo(() => {
        return getActiveFilters(status, columns)
    }, [filterValues, getActiveFilters])

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch =
                searchTerm === '' ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.compatible.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCategory =
                filterValues.categories.length === 0 ||
                filterValues.categories.includes(product.category || '')
            const matchesBrand =
                filterValues.brands.length === 0 ||
                filterValues.brands.includes(product.brand || '')

            let matchesStatus = true

            if (filterValues.status.length > 0) {
                const statusText = getStockStatus(product.qty).text
                const selectedLabels = status
                    .filter((s) => filterValues.status.includes(s.key))
                    .map((s) => s.label)

                matchesStatus = selectedLabels.includes(statusText)
            }

            return matchesSearch && matchesCategory && matchesBrand && matchesStatus
        })
    }, [products, searchTerm, filterValues])

    const { totalPrice, totalProducts } = useMemo(() => {
        const total = filteredProducts.reduce((acc, product) => {
            return acc + product.purchase * product.qty
        }, 0)

        return {
            totalPrice: total,
            totalProducts: filteredProducts.length,
        }
    }, [filteredProducts])

    const pageSize = 10
    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredProducts.length / pageSize))
    }, [filteredProducts])

    useEffect(() => {
        setCurrentPage((p) => Math.min(p, totalPages))
    }, [totalPages])

    const paginatedProducts = useMemo(() => {
        // Sort products alphabetically by name to maintain consistent order
        const sortedProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name))

        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize

        return sortedProducts.slice(startIndex, endIndex)
    }, [filteredProducts, currentPage])

    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

    const visibleColumns = useMemo(() => {
        const selected = new Set(filterValues.columns)

        return columns.filter((col) => {
            if (!filterableColumns.find((f) => f.key === col.key)) return true

            return selected.has(col.key)
        })
    }, [columns, filterableColumns, filterValues.columns])

    const showPagination = filteredProducts.length > pageSize
    const { outOfStockCount, lowStockCount } = useMemo(() => {
        let outOf = 0
        let low = 0

        for (const product of filteredProducts) {
            const statusText = getStockStatus(product.qty).text

            if (statusText === 'Sold Out') outOf++
            else if (statusText === 'Low Stock') low++
        }

        return { outOfStockCount: outOf, lowStockCount: low }
    }, [filteredProducts])

    const stats = useMemo(
        () => [
            {
                title: 'Total Price',
                value: formatPrice(totalPrice),
                color: 'text-emerald-500',
            },
            {
                title: 'Total Products',
                value: String(totalProducts),
                color: 'text-foreground',
            },
            {
                title: 'Sold Out',
                value: String(outOfStockCount),
                color: 'text-red-500',
            },
            {
                title: 'Low Stock',
                value: String(lowStockCount),
                color: 'text-amber-500',
            },
        ],
        [totalPrice, totalProducts, outOfStockCount, lowStockCount]
    )

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        onEditOpen()
    }

    const handleDelete = (product: Product) => {
        setDeletingProduct(product)
        onDeleteOpen()
    }

    const toggleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set())
        } else {
            const allIds = new Set<string>(filteredProducts.map((p) => p.id.toString()))

            setSelectedProducts(allIds)
        }
    }

    const toggleProductSelection = (productId: string) => {
        const newSelected = new Set(selectedProducts)

        if (newSelected.has(productId)) {
            newSelected.delete(productId)
        } else {
            newSelected.add(productId)
        }
        setSelectedProducts(newSelected)
    }

    const renderCell = (product: Product, columnKey: string) => {
        switch (columnKey) {
            case 'select':
                return (
                    <Checkbox
                        aria-label='Select row'
                        checked={selectedProducts.has(product.id.toString())}
                        onCheckedChange={() => toggleProductSelection(product.id.toString())}
                    />
                )
            case 'product':
                return (
                    <>
                        <h3>{product.name}</h3>
                        <p className='text-muted-foreground text-[10px]'>
                            Category: {product.category}
                        </p>
                    </>
                )
            case 'compatibility':
                return product.compatible
            case 'purchase':
                return formatPrice(product.purchase ?? 0)
            case 'staff':
                return formatPrice(product.staff_price ?? 0)
            case 'price':
                return formatPrice(product.price ?? 0)
            case 'quantity':
                return <Quantity canManage={canManage} product={product} />
            case 'status':
                return (
                    <Badge
                        className={`rounded-sm border-none text-white ${getStockStatus(product.qty).color}`}
                    >
                        {getStockStatus(product.qty).text}
                    </Badge>
                )
            case 'total':
                return formatPrice(product.purchase * product.qty)
            case 'actions':
                return (
                    canManage && (
                        <div className='flex items-center justify-center gap-2'>
                            <Tooltip content={<p>Edit Product</p>}>
                                <Button
                                    isIconOnly
                                    className='border'
                                    radius='full'
                                    size='sm'
                                    startContent={<Edit size={16} />}
                                    variant='light'
                                    onPress={() => handleEdit(product)}
                                />
                            </Tooltip>
                            <Tooltip content={<p>Delete Product</p>}>
                                <Button
                                    isIconOnly
                                    className='border'
                                    color='danger'
                                    radius='full'
                                    size='sm'
                                    startContent={<Delete />}
                                    variant='light'
                                    onPress={() => handleDelete(product)}
                                />
                            </Tooltip>
                        </div>
                    )
                )
            case 'created_at':
                return formatDateTime(product.created_at)
            case 'updated_at':
                return formatDateTime(product.updated_at)

            default:
                return null
        }
    }

    return (
        <main className='space-y-4'>
            <Navbar
                shouldHideOnScroll
                classNames={{
                    wrapper: 'h-auto p-0 py-2',
                }}
                maxWidth='full'
            >
                <div className='flex flex-col items-start select-none'>
                    <h1 className='text-lg font-bold'>Products List</h1>
                    <p className='text-muted-foreground text-[10px] sm:text-sm'>
                        Here you can find all of your products
                    </p>
                </div>
                {canManage && (
                    <Button
                        className='border-1.5 bg-default/20 min-w-fit rounded-sm border-dashed'
                        size='sm'
                        startContent={<Plus size={20} />}
                        variant='light'
                        onPress={() => {
                            setAddProduct(null)
                            onAddOpen()
                        }}
                    >
                        Create Product
                    </Button>
                )}
            </Navbar>

            <div className='border-border from-sidebar/60 to-sidebar grid grid-cols-2 rounded-xl border bg-linear-to-br min-[1200px]:grid-cols-4'>
                {stats.map((stat) => (
                    <StatsCard key={stat.title} {...stat} />
                ))}
            </div>
            <div className='overflow-hidden rounded-sm border'>
                <TopContent
                    activeFilters={activeFilters}
                    brands={brands}
                    categories={categories}
                    columns={filterableColumns}
                    products={products}
                    reset={reset}
                    searchTerm={searchTerm}
                    selectedProducts={selectedProducts}
                    setSearchTerm={setSearchTerm}
                    status={status}
                />
                <Table aria-label='Inventory Management - Product Catalog'>
                    <TableHeader className='border-t'>
                        <TableRow className='*:border-border bg-default/20 text-muted-foreground [&>:not(:last-child)]:border-r'>
                            {visibleColumns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={column.key === 'product' ? 'text-start' : ''}
                                >
                                    {column.key === 'select' ? (
                                        <Checkbox
                                            aria-label='Select all'
                                            checked={
                                                selectedProducts.size === filteredProducts.length
                                                    ? true
                                                    : selectedProducts.size > 0
                                                      ? 'indeterminate'
                                                      : false
                                            }
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    ) : (
                                        column.label
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow className='hover:bg-transparent'>
                                <TableCell
                                    className='py-12 text-center'
                                    colSpan={visibleColumns.length}
                                >
                                    <EmptyState
                                        description='There are no products in this space.'
                                        icon={PackageOpen}
                                        title='No products found'
                                    />
                                </TableCell>
                            </TableRow>
                        ) : paginatedProducts.length === 0 && searchTerm ? (
                            <TableRow className='hover:bg-transparent'>
                                <TableCell
                                    className='py-12 text-center'
                                    colSpan={visibleColumns.length}
                                >
                                    <EmptyState
                                        description='No products match your search criteria'
                                        icon={SearchX}
                                        title='No results found'
                                    />
                                </TableCell>
                            </TableRow>
                        ) : paginatedProducts.length === 0 ? (
                            <TableRow className='hover:bg-transparent'>
                                <TableCell
                                    className='py-12 text-center'
                                    colSpan={visibleColumns.length}
                                >
                                    <EmptyState
                                        description='Try adjusting your filters'
                                        icon={Filter}
                                        title='No products found'
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedProducts.map((product) => (
                                <TableRow
                                    key={product.id}
                                    className='*:border-border [&>:not(:last-child)]:border-r'
                                    data-state={
                                        selectedProducts.has(product.id.toString()) && 'selected'
                                    }
                                >
                                    {visibleColumns.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={
                                                column.key === 'product'
                                                    ? 'text-start'
                                                    : 'text-center'
                                            }
                                        >
                                            {renderCell(product, column.key)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <BottomContent
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    showPagination={showPagination}
                    totalPages={totalPages}
                />
            </div>
            {/* <AddEdit
                brands={brand}
                isOpen={isAddOpen}
                mode='add'
                product={addProduct}
                onClose={onAddClose}
            />

            <AddEdit
                brands={brand}
                isOpen={isEditOpen}
                mode='edit'
                product={editingProduct}
                onClose={onEditClose}
            /> */}

            <DeleteProduct
                isOpen={isDeleteOpen}
                product={deletingProduct}
                onClose={onDeleteClose}
            />
        </main>
    )
}

const EmptyState = ({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ElementType
    title: string
    description: string
}) => (
    <div className='flex flex-col items-center justify-center space-y-2 py-8 select-none'>
        <Icon className='text-muted-foreground h-9 w-9' />
        <p className='text-base font-medium'>{title}</p>
        <p className='text-muted-foreground text-sm'>{description}</p>
    </div>
)
