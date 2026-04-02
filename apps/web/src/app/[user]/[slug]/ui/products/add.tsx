'use client'

import type { ChangeEvent } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    CirclePlus,
    Copy,
    GalleryHorizontalEnd,
    ImagePlus,
    Plus,
    RefreshCcw,
    Settings2,
    X,
} from 'lucide-react'
import { LuBadgeIndianRupee } from 'react-icons/lu'
import { HiColorSwatch } from 'react-icons/hi'
import { Button, InputGroup, ScrollShadow, TextField, Label } from '@heroui/react'
import { toast } from 'sonner'

import { useAddProduct, useUpdateProduct } from '@/hooks/tanstack/mutation'
import { useBrands, useCategories, useColors } from '@/hooks/tanstack/query'
import { prepareProduct } from '@/hooks/cloudflare'
import { storage } from '@/config/site'
import { bucketUrl } from '@/supabase/bucket'
import { Delete } from '@/ui/icons'
import { RichTextEditor } from '@/ui/rich-text-editor'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion'
import { useProductStore } from '@/zustand/store/product'
import type { Product, ProductVariant } from '@/types/product'

const EMPTY_VARIANT: ProductVariant = {
    id: '',
    brand: '',
    storage: '',
    purchase_price: 0,
    wholesale_price: 0,
    price: 0,
    mrp: 0,
    quantity: 0,
    image: [],
    color: null,
}

interface AddModalProps {
    mode: 'add' | 'update'
    isOpen: boolean
}

function Field({
    label,
    value,
    placeholder,
    description,
    required = false,
    invalid = false,
    error,
    type,
    listId,
    onChange,
}: {
    label: string
    value: string
    placeholder?: string
    description?: string
    required?: boolean
    invalid?: boolean
    error?: string
    type?: string
    listId?: string
    onChange: (value: string) => void
}) {
    return (
        <TextField isInvalid={invalid} isRequired={required}>
            <Label>{label}</Label>
            <InputGroup>
                <InputGroup.Input
                    list={listId}
                    placeholder={placeholder}
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </InputGroup>
            {description ? <p className='text-muted-foreground mt-1 text-xs'>{description}</p> : null}
            {error ? <p className='text-danger mt-1 text-xs'>{error}</p> : null}
        </TextField>
    )
}

function MoneyField({
    label,
    description,
    value,
    onChange,
}: {
    label: string
    description: string
    value: number
    onChange: (value: number) => void
}) {
    return (
        <TextField>
            <Label>{label}</Label>
            <InputGroup>
                <InputGroup.Prefix>Rs</InputGroup.Prefix>
                <InputGroup.Input
                    inputMode='numeric'
                    placeholder='0'
                    type='number'
                    value={String(value ?? 0)}
                    onChange={(event) => onChange(Number(event.target.value))}
                />
            </InputGroup>
            <p className='text-muted-foreground mt-1 text-xs'>{description}</p>
        </TextField>
    )
}

export function AddProduct({ mode, isOpen }: AddModalProps) {
    const { data: categories, isLoading: categoriesLoading } = useCategories()
    const router = useRouter()
    const {
        form,
        errors,
        setForm,
        addVariant,
        duplicateVariant,
        updateVariant,
        removeVariant,
        resetForm,
        editingProduct,
        validate,
        setUploading,
        isUploading,
        remoteUpdateAvailable,
        reloadFromRemote,
    } = useProductStore()
    const { mutateAsync: createMutate, isPending: isCreating } = useAddProduct()
    const { mutateAsync: updateMutate, isPending: isUpdating } = useUpdateProduct()

    if (!isOpen) return null

    const handleClose = () => {
        router.back()
    }

    const handleSubmit = async () => {
        if (!validate()) {
            toast.warning('Missing Required Fields', {
                description: 'Please fill in all required fields before submitting.',
            })
            return
        }

        try {
            setUploading(true)
            const preparedProduct = await prepareProduct(form as Product)
            setUploading(false)

            if (mode === 'add') {
                await createMutate(preparedProduct)
                toast.success(`${preparedProduct.name} added`, {
                    description: 'Product added successfully.',
                })
            } else if (mode === 'update' && editingProduct) {
                await updateMutate({
                    ...editingProduct,
                    ...preparedProduct,
                    updated_at: editingProduct.updated_at,
                })
                toast.success(`${preparedProduct.name} updated`, {
                    description: 'Product updated successfully.',
                })
            }

            resetForm()
            handleClose()
        } catch (error) {
            setUploading(false)
            toast.error('Submission failed', {
                description: (error as Error)?.message || 'Something went wrong.',
            })
        }
    }

    const title = mode === 'add' ? 'Add Product' : 'Edit Product'
    const submitLabel = mode === 'add' ? 'Add Product' : 'Update Product'
    const headerIcon = mode === 'add' ? <CirclePlus size={20} /> : <Settings2 size={20} />
    const firstVariant = form.variants?.[0] ?? EMPTY_VARIANT

    return (
        <section className='flex h-full flex-col overflow-hidden rounded-2xl border bg-background'>
            <div className='flex items-center justify-between border-b p-3 select-none'>
                <p className='flex items-center gap-2 text-lg font-semibold'>
                    {headerIcon}
                    {title}
                </p>
                <Button isIconOnly aria-label='Close editor' className='border' size='sm' variant='ghost' onPress={handleClose}>
                    <X size={18} />
                </Button>
            </div>

            <ScrollShadow className='flex flex-col gap-3 px-3 py-2' hideScrollBar>
                {mode === 'update' && remoteUpdateAvailable ? (
                    <div className='flex items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5'>
                        <p className='text-sm'>This product changed in another session. Reload latest data.</p>
                        <Button size='sm' variant='secondary' onPress={reloadFromRemote}>
                            <RefreshCcw className='mr-2' size={14} />
                            Reload
                        </Button>
                    </div>
                ) : null}

                <datalist id='product-categories'>
                    {(categories?.categories || []).map((category) => (
                        <option key={category.name} value={category.name} />
                    ))}
                </datalist>

                <div className='flex flex-col-reverse gap-3 md:flex-row'>
                    <div className='bg-background/60 flex w-full flex-col gap-4 rounded-xl border p-3 md:p-4'>
                        <Field
                            description='Enter product name'
                            error={errors.name}
                            invalid={Boolean(errors.name)}
                            label='Product Name'
                            placeholder='e.g., Redmi K20 Pro'
                            required
                            value={form.name || ''}
                            onChange={(value) => setForm({ name: value })}
                        />

                        <Field
                            description={categoriesLoading ? 'Loading categories...' : 'Select a category'}
                            error={errors.category}
                            invalid={Boolean(errors.category)}
                            label='Category'
                            listId='product-categories'
                            placeholder='Choose category'
                            required
                            value={form.category || ''}
                            onChange={(value) => setForm({ category: value })}
                        />
                    </div>

                    <div className='shrink-0 md:size-50'>
                        {form.thumbnail ? (
                            <div className='group relative aspect-square size-full overflow-hidden rounded-lg border'>
                                <Image
                                    alt='Thumbnail'
                                    className='object-cover'
                                    fill
                                    src={typeof form.thumbnail === 'string' ? bucketUrl(form.thumbnail) : URL.createObjectURL(form.thumbnail)}
                                />
                                <Button
                                    isIconOnly
                                    className='absolute -top-1 -right-1 z-30 h-6 w-6 min-w-0 rounded-full p-0 shadow-md'
                                    size='sm'
                                    variant='danger'
                                    onPress={() => setForm({ thumbnail: '' })}
                                >
                                    <X className='size-4' />
                                </Button>
                            </div>
                        ) : (
                            <label className='bg-background/60 hover:border-foreground/40 flex aspect-video size-full min-h-0 min-w-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition md:aspect-square'>
                                <div className='flex flex-col items-center gap-2'>
                                    <div className='bg-default-100 flex size-11 items-center justify-center rounded-full border'>
                                        <ImagePlus className='text-default-500' size={20} />
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        <p className='text-sm font-medium'>Thumbnail</p>
                                        <p className='text-muted-foreground text-[11px]'>Main product image</p>
                                    </div>
                                </div>
                                <input
                                    accept='image/*'
                                    capture='environment'
                                    hidden
                                    type='file'
                                    onChange={(event) => {
                                        const file = event.target.files?.[0]
                                        if (file) setForm({ thumbnail: file })
                                    }}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <TextField>
                    <Label>Compatibility</Label>
                    <InputGroup>
                        <InputGroup.TextArea
                            placeholder='e.g., K20 - K20 Pro - 9T - 9T Pro'
                            rows={2}
                            value={form.compatibility || ''}
                            onChange={(event) => setForm({ compatibility: event.target.value })}
                        />
                    </InputGroup>
                    <p className='text-muted-foreground mt-1 text-xs'>Supported models or devices</p>
                </TextField>

                <div className='flex flex-col gap-1'>
                    <label className='text-sm font-medium'>Description</label>
                    <RichTextEditor
                        placeholder='Describe key features, highlights, warranty, and more'
                        value={form.description || ''}
                        onChange={(value) => setForm({ description: value })}
                    />
                    <p className='text-muted-foreground text-xs'>
                        Supports headings, lists, links, and inline text formatting.
                    </p>
                </div>

                {form.variants && form.variants.length <= 1 ? (
                    <div>
                        <VariantForm index={0} variant={firstVariant} updateVariant={updateVariant} />

                        <div className='flex items-center'>
                            <div className='bg-default/20 h-px flex-1' />
                            <Button
                                className='rounded-full px-4 font-medium'
                                size='sm'
                                variant='secondary'
                                onPress={() => addVariant({ ...EMPTY_VARIANT })}
                            >
                                <Plus className='mr-2' size={16} />
                                Add Variant
                            </Button>
                            <div className='bg-default/20 h-px flex-1' />
                        </div>
                    </div>
                ) : (
                    <Accordion className='space-y-2' collapsible type='single' defaultValue='variant-0'>
                        {form.variants?.map((variant, index) => (
                            <AccordionItem
                                key={`variant-${index}`}
                                className='bg-background rounded-xl border px-3 py-1 outline-none last:border-b md:px-4'
                                value={`variant-${index}`}
                            >
                                <div className='flex items-center gap-2'>
                                    <AccordionTrigger className='py-2 text-[15px] leading-6 no-underline hover:no-underline'>
                                        <span className='flex flex-wrap items-center gap-3'>
                                            {variant.brand || `Variant ${index + 1}`}
                                            {variant.color ? (
                                                <span className='flex items-center gap-2'>
                                                    <span
                                                        className='inline-block size-4 rounded-full border shadow-sm'
                                                        style={{ backgroundColor: variant.color.hex }}
                                                    />
                                                    {variant.color.name}
                                                </span>
                                            ) : null}
                                            {variant.storage ? <span>{variant.storage}</span> : null}
                                        </span>
                                    </AccordionTrigger>
                                    <Button isIconOnly size='sm' variant='ghost' onPress={() => duplicateVariant(index)}>
                                        <Copy size={16} />
                                    </Button>
                                    {index === 0 ? (
                                        <Button isIconOnly size='sm' variant='ghost' onPress={() => addVariant({ ...EMPTY_VARIANT })}>
                                            <CirclePlus size={18} />
                                        </Button>
                                    ) : (
                                        <Button isIconOnly size='sm' variant='danger' onPress={() => removeVariant(index)}>
                                            <Delete />
                                        </Button>
                                    )}
                                </div>
                                <AccordionContent className='pb-3'>
                                    <VariantForm index={index} variant={variant} updateVariant={updateVariant} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </ScrollShadow>

            <div className='flex flex-col gap-2 border-t p-3 md:flex-row'>
                <Button
                    className='w-full'
                    isPending={isCreating || isUpdating || isUploading}
                    size='sm'
                    variant='primary'
                    onPress={handleSubmit}
                >
                    {submitLabel}
                </Button>
                <Button className='w-full border' size='sm' variant='ghost' onPress={handleClose}>
                    Cancel
                </Button>
            </div>
        </section>
    )
}

interface VariantFormProps {
    index: number
    variant: ProductVariant
    updateVariant: (index: number, variant: Partial<ProductVariant>) => void
}

function VariantForm({ index, variant, updateVariant }: VariantFormProps) {
    const { errors } = useProductStore()
    const { data: brands, isLoading: brandsLoading } = useBrands()
    const { filteredColors, colorsLoading, onInputChange } = useColors()

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? [])
        if (!files.length) return

        const existing = variant.image?.filter((item) => item instanceof File || typeof item === 'string') ?? []
        const remainingSlots = 3 - existing.length
        const newFiles = files.slice(0, remainingSlots)

        updateVariant(index, { image: [...existing, ...newFiles] })
        event.target.value = ''
    }

    const handleColorChange = (value: string) => {
        onInputChange(value)
        const selected = filteredColors.find((color) => color.name.toLowerCase() === value.toLowerCase())
        updateVariant(index, {
            color: selected ? { name: selected.name, hex: selected.hex } : value ? variant.color : null,
        })
    }

    return (
        <div className='space-y-4'>
            <Accordion collapsible type='single' defaultValue={`pricing-${index}`}>
                <AccordionItem value={`pricing-${index}`}>
                    <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline'>
                        <span className='flex items-center gap-3'>
                            <LuBadgeIndianRupee size={20} />
                            <span>Pricing & Stock</span>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className='px-2'>
                        <datalist id={`brand-options-${index}`}>
                            {(brands?.brands || []).map((brand) => (
                                <option key={brand.name} value={brand.name} />
                            ))}
                        </datalist>

                        <div className='grid gap-4 md:grid-cols-2'>
                            <Field
                                description={brandsLoading ? 'Loading brands...' : 'Select a brand'}
                                error={errors[`variant-${index}-brand`]}
                                invalid={Boolean(errors[`variant-${index}-brand`])}
                                label='Brand'
                                listId={`brand-options-${index}`}
                                placeholder='Choose brand'
                                required
                                value={variant.brand || ''}
                                onChange={(value) => updateVariant(index, { brand: value })}
                            />
                            <Field
                                description='Stock quantity'
                                error={errors[`variant-${index}-quantity`]}
                                invalid={Boolean(errors[`variant-${index}-quantity`])}
                                label='Quantity'
                                placeholder='0'
                                required
                                type='number'
                                value={String(variant.quantity ?? 0)}
                                onChange={(value) => updateVariant(index, { quantity: Number(value) })}
                            />
                        </div>

                        <div className='mt-1 grid grid-cols-2 gap-4 md:grid-cols-4'>
                            <MoneyField
                                description='Cost price'
                                label='Purchase'
                                value={variant.purchase_price ?? 0}
                                onChange={(value) => updateVariant(index, { purchase_price: value })}
                            />
                            <MoneyField
                                description='Wholesale price'
                                label='Wholesale'
                                value={variant.wholesale_price ?? 0}
                                onChange={(value) => updateVariant(index, { wholesale_price: value })}
                            />
                            <MoneyField
                                description='Retail price'
                                label='Price'
                                value={variant.price ?? 0}
                                onChange={(value) => updateVariant(index, { price: value })}
                            />
                            <MoneyField
                                description='Online price'
                                label='MRP'
                                value={variant.mrp ?? 0}
                                onChange={(value) => updateVariant(index, { mrp: value })}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value={`variants-${index}`}>
                    <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline'>
                        <span className='flex items-center gap-3'>
                            <HiColorSwatch size={20} />
                            <span>Color & Storage</span>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className='px-2'>
                        <datalist id={`color-options-${index}`}>
                            {filteredColors.map((color) => (
                                <option key={color.name} value={color.name} />
                            ))}
                        </datalist>

                        <datalist id={`storage-options-${index}`}>
                            {(storage || []).map((item) => (
                                <option key={item.name} value={item.name} />
                            ))}
                        </datalist>

                        <div className='grid gap-4 px-2 md:grid-cols-2'>
                            <Field
                                description={colorsLoading ? 'Loading colors...' : 'Select product color'}
                                label='Color'
                                listId={`color-options-${index}`}
                                placeholder='e.g., Black, Blue, Silver'
                                value={variant.color?.name || ''}
                                onChange={handleColorChange}
                            />

                            <Field
                                description='Select storage option'
                                label='Storage'
                                listId={`storage-options-${index}`}
                                placeholder='e.g., 8GB / 128GB'
                                value={variant.storage || ''}
                                onChange={(value) => updateVariant(index, { storage: value })}
                            />
                        </div>

                        {variant.color ? (
                            <div className='mt-3 flex items-center gap-2 px-2 text-sm'>
                                <span
                                    className='inline-block size-4 rounded-full border shadow-sm'
                                    style={{ backgroundColor: variant.color.hex }}
                                />
                                <span>{variant.color.name}</span>
                            </div>
                        ) : null}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value={`images-${index}`}>
                    <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline'>
                        <span className='flex items-center gap-3'>
                            <GalleryHorizontalEnd size={20} />
                            <span>Product Images</span>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className='px-2'>
                        <div className='flex flex-wrap items-center gap-2'>
                            {(variant.image ?? []).map((fileOrUrl, imageIndex) => {
                                const src =
                                    typeof fileOrUrl === 'string'
                                        ? bucketUrl(fileOrUrl)
                                        : URL.createObjectURL(fileOrUrl)

                                return (
                                    <div key={imageIndex} className='group relative shrink-0'>
                                        <Image
                                            alt={`Image ${imageIndex + 1}`}
                                            className='size-20 rounded-lg border object-cover'
                                            height={80}
                                            src={src}
                                            width={80}
                                        />
                                        <Button
                                            isIconOnly
                                            className='absolute -top-1 -right-1 z-30 h-6 w-6 min-w-0 rounded-full p-0 shadow-md'
                                            size='sm'
                                            variant='danger'
                                            onPress={() => {
                                                const updatedImages = [...(variant.image ?? [])]
                                                updatedImages.splice(imageIndex, 1)
                                                updateVariant(index, { image: updatedImages })
                                            }}
                                        >
                                            <X className='size-4' />
                                        </Button>
                                    </div>
                                )
                            })}

                            {(variant.image?.length ?? 0) < 3 ? (
                                <label className='bg-background/60 flex size-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed'>
                                    <ImagePlus className='text-default-500' size={28} />
                                    <input
                                        accept='image/*'
                                        capture='environment'
                                        hidden
                                        multiple
                                        type='file'
                                        onChange={handleImageChange}
                                    />
                                </label>
                            ) : null}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
