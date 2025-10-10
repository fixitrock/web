'use client'

import { useActionState, useEffect, useState } from 'react'
import { addToast } from '@heroui/react'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { Label } from '@/ui/label'
import { Checkbox } from '@/ui/checkbox'
import { Switch } from '@/ui/switch'
import { Separator } from '@/ui/separator'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
} from '@/ui/drawer'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { addProduct, updateProduct } from '@/actions/user/product'
import { Product, ProductVariant } from '@/types/product'

import { ImageDropzone } from './dropzone'

interface AddEditProps {
    isOpen: boolean
    onClose: () => void
    mode: 'add' | 'edit'
    product?: Product | null
}

export default function AddEdit({ isOpen, onClose, mode, product }: AddEditProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [hasVariants, setHasVariants] = useState<boolean>(
        mode === 'edit' && product?.variants_cache ? product.variants_cache.length > 0 : false
    )
    const [baseImages, setBaseImages] = useState<File[]>([])
    const [variants, setVariants] = useState<Partial<ProductVariant>[]>(
        mode === 'edit' && product?.variants_cache
            ? product.variants_cache.map((variant) => ({ ...variant }))
            : [
                  {
                      color: null,
                      storage: null,
                      brand: null,
                      purchase: 0,
                      staff_price: 0,
                      price: 0,
                      mrp: 0,
                      qty: 0,
                      img: [],
                  },
              ]
    )
    const [variantConfig, setVariantConfig] = useState({
        color: true,
        size: true,
        brand: true,
        qty: true,
        price: true,
        mrp: true,
        staff_price: true,
        purchase: true,
        img: true,
    })

    // Form state
    const [formState, setFormState] = useState({
        name: product?.name || '',
        slug: product?.slug || '',
        brand: product?.brand || '',
        category: product?.category || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        mrp: product?.mrp?.toString() || '',
        staff_price: product?.staff_price?.toString() || '',
        purchase: product?.purchase?.toString() || '',
        qty: product?.qty?.toString() || '',
    })

    // Action state for product
    const [productState, productAction, isProductPending] = useActionState(
        mode === 'add' ? addProduct : updateProduct,
        { errors: {} }
    )

    // Handle form input changes
    const handleInputChange = (name: string, value: string) => {
        setFormState((prev) => ({ ...prev, [name]: value }))
    }

    // Handle variant configuration toggle
    const toggleConfig = (field: keyof typeof variantConfig) => {
        setVariantConfig((prev) => ({ ...prev, [field]: !prev[field] }))
    }

    // Add a new variant
    const addVariantRow = () => {
        setVariants((prev) => [
            ...prev,
            {
                color: null,
                size: null,
                brand: null,
                purchase: 0,
                staff_price: 0,
                price: 0,
                mrp: 0,
                qty: 0,
                img: [],
            },
        ])
    }

    // Remove a variant
    const removeVariant = (index: number) => {
        if (variants.length <= 1) return
        setVariants((prev) => prev.filter((_, i) => i !== index))
    }

    // Update a variant field
    const updateVariantField = (
        index: number,
        field: string,
        value: string | number | boolean | File[]
    ) => {
        setVariants((prev) => {
            const newVariants = [...prev]

            if (field === 'img') {
                // Convert File[] to string[] - in a real implementation, these would be uploaded and converted to URLs
                newVariants[index] = {
                    ...newVariants[index],
                    [field]: value as unknown as string[],
                }
            } else if (field === 'color') {
                newVariants[index] = {
                    ...newVariants[index],
                    color: value ? { name: value as string } : null,
                }
            } else if (typeof value === 'string' || typeof value === 'number') {
                newVariants[index] = { ...newVariants[index], [field]: value }
            }

            return newVariants
        })
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Prepare form data for product
        const formData = new FormData()

        // Add product fields
        Object.entries(formState).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value)
            }
        })

        // Add product images
        baseImages.forEach((file, _index) => {
            formData.append(`img`, file)
        })

        // Add product ID for edit mode
        if (mode === 'edit' && product?.id) {
            formData.append('id', product.id.toString())
        }

        // Submit product
        await productAction(formData)
    }

    // Handle success and error messages
    useEffect(() => {
        if (productState.errors && Object.keys(productState.errors).length > 0) {
            const errorMessage = productState.errors.general || 'Failed to save product'

            addToast({
                title: errorMessage,
                color: 'danger',
            })
        } else if (
            productState.errors &&
            Object.keys(productState.errors).length === 0 &&
            !isProductPending
        ) {
            addToast({
                title:
                    mode === 'add'
                        ? 'Product created successfully'
                        : 'Product updated successfully',
                color: 'success',
            })
            onClose()
        }
    }, [productState, isProductPending, mode, onClose])

    // Dynamic content based on mode
    const title = mode === 'add' ? 'Create Product' : 'Edit Product'
    const description =
        mode === 'add' ? 'Create a new product entry.' : `Modify details for "${product?.name}".`
    const submitText = mode === 'add' ? 'Add Product' : 'Update Product'

    return (
        <Drawer direction={isDesktop ? 'right' : 'bottom'} open={isOpen} onOpenChange={onClose}>
            <DrawerContent
                className='h-[85vh] data-[vaul-drawer-direction=right]:sm:max-w-md md:h-full'
                hideCloseButton={isDesktop ? true : false}
                showbar={isDesktop ? false : true}
            >
                <form className='overflow-y-scroll' onSubmit={handleSubmit}>
                    <DrawerHeader className='border-b p-2'>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>{description}</DrawerDescription>
                    </DrawerHeader>

                    <div className='flex flex-col space-y-6 overflow-y-auto p-2'>
                        {/* Basic Details */}
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='grid gap-2'>
                                <Label htmlFor='name'>Name</Label>
                                <Input
                                    required
                                    id='name'
                                    placeholder='Nike Dri-FIT T-Shirt'
                                    value={formState.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='brand'>Brand (base)</Label>
                                <Input
                                    id='brand'
                                    placeholder='Nike'
                                    value={formState.brand}
                                    onChange={(e) => handleInputChange('brand', e.target.value)}
                                />
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='category'>Category</Label>
                                <Input
                                    id='category'
                                    placeholder='Apparel'
                                    value={formState.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className='grid gap-2'>
                            <Label htmlFor='description'>Description</Label>
                            <Textarea
                                id='description'
                                placeholder='Lightweight, breathable t-shirt...'
                                rows={3}
                                value={formState.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                            <div className='grid gap-2'>
                                <Label htmlFor='price'>Price (base)</Label>
                                <Input
                                    id='price'
                                    inputMode='numeric'
                                    placeholder='799'
                                    value={formState.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                />
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='mrp'>MRP (base)</Label>
                                <Input
                                    id='mrp'
                                    inputMode='numeric'
                                    placeholder='999'
                                    value={formState.mrp}
                                    onChange={(e) => handleInputChange('mrp', e.target.value)}
                                />
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='staff_price'>Staff Price (base)</Label>
                                <Input
                                    id='staff_price'
                                    inputMode='numeric'
                                    placeholder='550'
                                    value={formState.staff_price}
                                    onChange={(e) =>
                                        handleInputChange('staff_price', e.target.value)
                                    }
                                />
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor='purchase'>Purchase (base)</Label>
                                <Input
                                    id='purchase'
                                    inputMode='numeric'
                                    placeholder='500'
                                    value={formState.purchase}
                                    onChange={(e) => handleInputChange('purchase', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Base images dropzone (max 5) */}
                        <div className='grid gap-2'>
                            <Label>Product Images (max 5)</Label>
                            <ImageDropzone
                                files={baseImages}
                                hint='Drag and drop images here or click to select'
                                maxFiles={5}
                                name='img'
                                setFiles={setBaseImages}
                            />
                        </div>

                        <Separator />

                        {/* Variants Toggle */}
                        <div className='flex items-center justify-between'>
                            <div className='grid'>
                                <div className='text-sm font-medium'>Add Variants</div>
                                <p className='text-muted-foreground text-xs'>
                                    When enabled, you can add multiple variants with flexible
                                    fields. If disabled, the product will be created without
                                    variants.
                                </p>
                            </div>
                            <Switch
                                aria-label='Toggle variants'
                                checked={hasVariants}
                                onCheckedChange={(checked) => setHasVariants(checked as boolean)}
                            />
                        </div>

                        {hasVariants ? (
                            <>
                                <div className='grid gap-3 rounded-lg border p-3'>
                                    <div className='text-sm font-medium'>Variant fields</div>
                                    <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
                                        <label className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                checked={variantConfig.color}
                                                onCheckedChange={() => toggleConfig('color')}
                                            />
                                            Color
                                        </label>
                                        <label className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                checked={variantConfig.size}
                                                onCheckedChange={() => toggleConfig('size')}
                                            />
                                            Size
                                        </label>
                                        <label className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                checked={variantConfig.brand}
                                                onCheckedChange={() => toggleConfig('brand')}
                                            />
                                            Brand
                                        </label>
                                        <label className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                checked={variantConfig.qty}
                                                onCheckedChange={() => toggleConfig('qty')}
                                            />
                                            Qty
                                        </label>
                                        <label className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                checked={variantConfig.price}
                                                onCheckedChange={() => toggleConfig('price')}
                                            />
                                            Price
                                        </label>
                                        <label className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                checked={variantConfig.mrp}
                                                onCheckedChange={() => toggleConfig('mrp')}
                                            />
                                            MRP
                                        </label>
                                        <label className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                checked={variantConfig.staff_price}
                                                onCheckedChange={() => toggleConfig('staff_price')}
                                            />
                                            Staff Price
                                        </label>
                                        <label className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                checked={variantConfig.purchase}
                                                onCheckedChange={() => toggleConfig('purchase')}
                                            />
                                            Purchase
                                        </label>
                                        <label className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                checked={variantConfig.img}
                                                onCheckedChange={() => toggleConfig('img')}
                                            />
                                            Images
                                        </label>
                                    </div>
                                </div>

                                {/* Variant Rows */}
                                <div className='grid gap-3'>
                                    <div className='flex items-center justify-between'>
                                        <div className='text-sm font-medium'>Variants</div>
                                        <Button size='sm' type='button' onClick={addVariantRow}>
                                            Add Variant
                                        </Button>
                                    </div>

                                    {variants.length === 0 ? (
                                        <p className='text-muted-foreground text-sm'>
                                            No variants added yet.
                                        </p>
                                    ) : null}

                                    <div className='grid gap-4'>
                                        {variants.map((v, i) => (
                                            <div
                                                key={i}
                                                className='grid gap-3 rounded-lg border p-3'
                                            >
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-sm font-medium'>
                                                        Variant #{i + 1}
                                                    </div>
                                                    <Button
                                                        size='sm'
                                                        type='button'
                                                        variant='destructive'
                                                        onClick={() => removeVariant(i)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>

                                                <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                                                    {variantConfig.color ? (
                                                        <div className='grid gap-2'>
                                                            <Label>Color</Label>
                                                            <Input
                                                                placeholder='Red'
                                                                value={v.color?.name || ''}
                                                                onChange={(e) =>
                                                                    updateVariantField(
                                                                        i,
                                                                        'color',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                    {variantConfig.size ? (
                                                        <div className='grid gap-2'>
                                                            <Label>Size</Label>
                                                            <Input
                                                                placeholder='M / 128GB / 55 inch'
                                                                value={v.storage || ''}
                                                                onChange={(e) =>
                                                                    updateVariantField(
                                                                        i,
                                                                        'size',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                    {variantConfig.brand ? (
                                                        <div className='grid gap-2'>
                                                            <Label>Brand</Label>
                                                            <Input
                                                                placeholder='Nike / Apple Limited'
                                                                value={v.brand || ''}
                                                                onChange={(e) =>
                                                                    updateVariantField(
                                                                        i,
                                                                        'brand',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                    {variantConfig.qty ? (
                                                        <div className='grid gap-2'>
                                                            <Label>Qty</Label>
                                                            <Input
                                                                inputMode='numeric'
                                                                placeholder='10'
                                                                value={v.qty?.toString() || ''}
                                                                onChange={(e) =>
                                                                    updateVariantField(
                                                                        i,
                                                                        'qty',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                    {variantConfig.price ? (
                                                        <div className='grid gap-2'>
                                                            <Label>Price</Label>
                                                            <Input
                                                                inputMode='numeric'
                                                                placeholder='799'
                                                                value={v.price?.toString() || ''}
                                                                onChange={(e) =>
                                                                    updateVariantField(
                                                                        i,
                                                                        'price',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                    {variantConfig.mrp ? (
                                                        <div className='grid gap-2'>
                                                            <Label>MRP</Label>
                                                            <Input
                                                                inputMode='numeric'
                                                                placeholder='999'
                                                                value={v.mrp?.toString() || ''}
                                                                onChange={(e) =>
                                                                    updateVariantField(
                                                                        i,
                                                                        'mrp',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                    {variantConfig.staff_price ? (
                                                        <div className='grid gap-2'>
                                                            <Label>Staff Price</Label>
                                                            <Input
                                                                inputMode='numeric'
                                                                placeholder='550'
                                                                value={
                                                                    v.staff_price?.toString() || ''
                                                                }
                                                                onChange={(e) =>
                                                                    updateVariantField(
                                                                        i,
                                                                        'staff_price',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                    {variantConfig.purchase ? (
                                                        <div className='grid gap-2'>
                                                            <Label>Purchase</Label>
                                                            <Input
                                                                inputMode='numeric'
                                                                placeholder='500'
                                                                value={v.purchase?.toString() || ''}
                                                                onChange={(e) =>
                                                                    updateVariantField(
                                                                        i,
                                                                        'purchase',
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                    {variantConfig.img ? (
                                                        <div className='grid gap-2 md:col-span-3'>
                                                            <Label>Variant Images (max 5)</Label>
                                                            <ImageDropzone
                                                                files={
                                                                    (v.img as unknown as File[]) ||
                                                                    []
                                                                }
                                                                hint='Drop images or click to add'
                                                                maxFiles={5}
                                                                name={`variant-${i}-img`}
                                                                setFiles={(files) =>
                                                                    updateVariantField(
                                                                        i,
                                                                        'img',
                                                                        files
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className='text-muted-foreground text-xs'>
                                Product will be created without variants. You can still set base
                                prices above.
                            </p>
                        )}
                    </div>

                    <DrawerFooter className='flex-row-reverse border-t p-2 select-none'>
                        <Button
                            className='flex-1'
                            type='button'
                            variant='secondary'
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button className='flex-1' disabled={isProductPending} type='submit'>
                            {isProductPending ? 'Saving...' : submitText}
                        </Button>
                    </DrawerFooter>
                </form>
            </DrawerContent>
        </Drawer>
    )
}
