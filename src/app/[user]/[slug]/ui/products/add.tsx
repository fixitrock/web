'use client'

import { useBrands, useCategories, useColors } from '@/hooks/tanstack/query'
import { useProductStore } from '@/zustand/store/product'
import { useAddProduct, useUpdateProduct } from '@/hooks/tanstack/mutation'
import {
    Autocomplete,
    AutocompleteItem,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ScrollShadow,
    Textarea,
    Image,
    addToast,
} from '@heroui/react'
import { Accordion as AccordionPrimitive } from 'radix-ui'
import { CirclePlus, GalleryHorizontalEnd, Plus, PlusIcon, Settings2, X } from 'lucide-react'
import { LuBadgeIndianRupee } from 'react-icons/lu'
import { BiImageAdd } from 'react-icons/bi'
import { Delete } from '@/ui/icons'
import type { Product, ProductVariant } from '@/types/product'
import { HiColorSwatch } from 'react-icons/hi'
import { storage } from '@/config/site'
import { useEffect } from 'react'
import { inputWrapperStyle } from '@/config/style'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/ui/accordion'

interface AddModalProps {
    mode: 'add' | 'update'
    isOpen: boolean
    onClose: () => void
}

export function AddProduct({ mode, isOpen, onClose }: AddModalProps) {
    const { data: cat, isLoading: catLoading } = useCategories()
    const {
        form,
        errors,
        setForm,
        addVariant,
        updateVariant,
        removeVariant,
        resetForm,
        setMode,
        editingProduct,
        validate,
    } = useProductStore()
    const { mutateAsync: createMutate, isPending: isCreating } = useAddProduct()
    const { mutateAsync: updateMutate, isPending: isUpdating } = useUpdateProduct()
    const handleSubmit = async () => {
        if (!validate()) {
            addToast({
                title: 'Missing Required Fields',
                description: 'Please fill in all required fields before submitting.',
                color: 'danger',
            })
            return
        }

        try {
            if (mode === 'add') {
                await createMutate(form as Product)
            } else if (mode === 'update' && editingProduct) {
                await updateMutate({ ...editingProduct, ...form })
            }

            resetForm()
            onClose()
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        if (isOpen && mode === 'add') {
            setMode('add')
        }
    }, [isOpen, mode, setMode])

    const Title = mode === 'add' ? 'Add Product' : 'Edit Product'
    const Submit = mode === 'add' ? 'Add Product' : 'Update Product'
    const Icon = mode === 'add' ? <CirclePlus size={20} /> : <Settings2 size={20} />
    return (
        <Modal
            hideCloseButton
            scrollBehavior='inside'
            size='xl'
            className='bg-background max-h-[80vh] border shadow-none'
            isOpen={isOpen}
            onClose={onClose}
        >
            <ModalContent>
                <ModalHeader className='flex items-center justify-between border-b p-2 select-none'>
                    <p className='flex items-center gap-2 text-lg font-semibold'>
                        {Icon} {Title}
                    </p>
                    <Button
                        isIconOnly
                        aria-label='Close modal'
                        className='border'
                        radius='full'
                        size='sm'
                        startContent={<X size={18} />}
                        variant='light'
                        onPress={onClose}
                    />
                </ModalHeader>

                <ModalBody className='p-0'>
                    <ScrollShadow className='flex flex-col gap-3 px-3 py-2' hideScrollBar>
                        <div className='grid gap-4 md:grid-cols-2'>
                            <Input
                                label='Product Name'
                                placeholder='e.g., Redmi K20 Pro'
                                labelPlacement='outside-top'
                                isRequired
                                isInvalid={!!errors.name}
                                errorMessage={errors.name}
                                classNames={{
                                    inputWrapper: inputWrapperStyle,
                                }}
                                size='sm'
                                description='Enter product name'
                                value={form.name}
                                onChange={(e) => setForm({ name: e.target.value })}
                            />

                            <Autocomplete
                                description='Select a category'
                                size='sm'
                                isLoading={catLoading}
                                defaultItems={cat?.categories || []}
                                popoverProps={{
                                    classNames: {
                                        content:
                                            'bg-background/80 backdrop-blur border shadow-none',
                                    },
                                }}
                                selectedKey={form.category}
                                onSelectionChange={(key) =>
                                    setForm({ category: key?.toString() ?? '' })
                                }
                                label='Category'
                                placeholder='Choose category'
                                isRequired
                                isInvalid={!!errors.category}
                                errorMessage={errors.category}
                                labelPlacement='outside-top'
                                allowsCustomValue
                                inputProps={{
                                    classNames: {
                                        inputWrapper: inputWrapperStyle,
                                    },
                                }}
                                defaultFilter={(textValue, inputValue) => {
                                    const lowerTextValue = textValue.toLowerCase()
                                    const lowerInputValue = inputValue.toLowerCase()
                                    const category = (cat?.categories || []).find(
                                        (c) => c.name === textValue
                                    )
                                    if (lowerTextValue.includes(lowerInputValue)) return true
                                    if (
                                        category?.keywords?.some((keyword) =>
                                            keyword.toLowerCase().includes(lowerInputValue)
                                        )
                                    )
                                        return true
                                    return false
                                }}
                            >
                                {(c) => <AutocompleteItem key={c.name}>{c.name}</AutocompleteItem>}
                            </Autocomplete>
                        </div>

                        <Input
                            label='Compatibility'
                            placeholder='e.g., K20, K20 Pro, 9T, 9T Pro'
                            labelPlacement='outside-top'
                            value={form.compatibility!}
                            onChange={(e) => setForm({ compatibility: e.target.value })}
                            classNames={{
                                inputWrapper: inputWrapperStyle,
                            }}
                            size='sm'
                            description='Supported models or devices'
                        />

                        <Textarea
                            classNames={{
                                inputWrapper: inputWrapperStyle,
                            }}
                            labelPlacement='outside-top'
                            label='Description'
                            placeholder='e.g., Features, specs, and highlights'
                            size='sm'
                            value={form.description!}
                            onChange={(e) => setForm({ description: e.target.value })}
                        />

                        {form.variants && form.variants.length <= 1 ? (
                            <div>
                                <VariantForm
                                    key={'single'}
                                    index={0}
                                    variant={form.variants[0]}
                                    updateVariant={updateVariant}
                                />

                                <div className='flex items-center'>
                                    <div className='bg-default/20 h-px flex-1' />
                                    <Button
                                        size='sm'
                                        variant='flat'
                                        className='rounded-full px-4 font-medium'
                                        startContent={<Plus size={16} />}
                                        onPress={() =>
                                            addVariant({
                                                brand: '',
                                                storage: '',
                                                purchase_price: 0,
                                                wholesale_price: 0,
                                                price: 0,
                                                mrp: 0,
                                                quantity: 0,
                                                image: [],
                                                color: null,
                                            })
                                        }
                                    >
                                        Add Variant
                                    </Button>
                                    <div className='bg-default/20 h-px flex-1' />
                                </div>
                            </div>
                        ) : (
                            <Accordion
                                type='single'
                                collapsible
                                className='space-y-2'
                                defaultValue='variant-0'
                            >
                                {form.variants?.map((v, idx) => (
                                    <AccordionItem
                                        value={`variant-${idx}`}
                                        className='bg-background rounded-md border px-4 py-1 outline-none last:border-b'
                                    >
                                        <AccordionPrimitive.Header className='flex items-center'>
                                            <AccordionPrimitive.Trigger className='[&[data-state=open]>svg>path:last-child]:opacity-0" flex flex-1 items-center gap-4 rounded-md py-2 text-left text-sm text-[15px] leading-6 font-semibold transition-all outline-none focus-visible:ring-0 [&>svg]:-order-1 [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90'>
                                                Variant {idx + 1}
                                                <PlusIcon
                                                    size={16}
                                                    className='pointer-events-none shrink-0 opacity-60 transition-transform duration-200'
                                                    aria-hidden='true'
                                                />
                                            </AccordionPrimitive.Trigger>

                                            {idx === 0 ? (
                                                <Button
                                                    variant='light'
                                                    startContent={<CirclePlus size={18} />}
                                                    size='sm'
                                                    isIconOnly
                                                    onPress={() =>
                                                        addVariant({
                                                            brand: '',
                                                            storage: '',
                                                            purchase_price: 0,
                                                            wholesale_price: 0,
                                                            price: 0,
                                                            mrp: 0,
                                                            quantity: 0,
                                                            image: [],
                                                            color: null,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <Button
                                                    color='danger'
                                                    variant='light'
                                                    startContent={<Delete />}
                                                    size='sm'
                                                    isIconOnly
                                                    onPress={() => removeVariant(idx)}
                                                />
                                            )}
                                        </AccordionPrimitive.Header>
                                        <AccordionContent className='pb-2'>
                                            <VariantForm
                                                index={idx}
                                                variant={v}
                                                updateVariant={updateVariant}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </ScrollShadow>
                </ModalBody>

                <ModalFooter className='flex-row-reverse border-t p-2'>
                    <Button
                        className='w-full'
                        color='primary'
                        radius='full'
                        size='sm'
                        isLoading={isCreating || isUpdating}
                        onPress={handleSubmit}
                    >
                        {Submit}
                    </Button>
                    <Button
                        className='w-full border'
                        radius='full'
                        variant='light'
                        size='sm'
                        onPress={onClose}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

interface VariantFormProps {
    index: number
    variant: ProductVariant
    updateVariant: (index: number, variant: Partial<ProductVariant>) => void
}

function VariantForm({ index, variant, updateVariant }: VariantFormProps) {
    const { errors } = useProductStore()
    const { data, isLoading } = useBrands()
    const { filteredColors, colorsLoading, onInputChange } = useColors()
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(0, 3)
        updateVariant(index, { image: files })
    }

    return (
        <Accordion type='single' collapsible defaultValue={`pricing-${index}`}>
            <AccordionItem key={`pricing-${index}`} value={`pricing-${index}`}>
                <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline'>
                    <span className='flex items-center gap-3'>
                        <LuBadgeIndianRupee size={20} />
                        <span>Pricing & Stock</span>
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <Autocomplete
                            description='Select a brand'
                            size='sm'
                            isLoading={isLoading}
                            defaultItems={data?.brands || []}
                            popoverProps={{
                                classNames: {
                                    content: 'bg-background/80 backdrop-blur border shadow-none',
                                },
                            }}
                            selectedKey={variant?.brand!}
                            onSelectionChange={(key) =>
                                updateVariant(index, { brand: key?.toString() ?? '' })
                            }
                            label='Brand'
                            placeholder='Choose brand'
                            isRequired
                            isInvalid={!!errors[`variant-${index}-brand`]}
                            errorMessage={errors[`variant-${index}-brand`]}
                            labelPlacement='outside-top'
                            allowsCustomValue
                            inputProps={{
                                classNames: {
                                    inputWrapper: inputWrapperStyle,
                                },
                            }}
                            defaultFilter={(textValue, inputValue) => {
                                const lowerTextValue = textValue.toLowerCase()
                                const lowerInputValue = inputValue.toLowerCase()
                                const brand = (data?.brands || []).find((b) => b.name === textValue)
                                if (lowerTextValue.includes(lowerInputValue)) return true
                                if (
                                    brand?.keywords?.some((keyword: string) =>
                                        keyword.toLowerCase().includes(lowerInputValue)
                                    )
                                )
                                    return true
                                return false
                            }}
                        >
                            {(b) => <AutocompleteItem key={b.name}>{b.name}</AutocompleteItem>}
                        </Autocomplete>

                        <Input
                            classNames={{
                                inputWrapper: inputWrapperStyle,
                            }}
                            label='Quantity'
                            description='Stock quantity'
                            isRequired
                            isInvalid={!!errors[`variant-${index}-quantity`]}
                            errorMessage={errors[`variant-${index}-quantity`]}
                            value={variant?.quantity?.toString()}
                            type='number'
                            placeholder='0'
                            onChange={(e) => updateVariant(index, { quantity: +e.target.value })}
                            size='sm'
                            labelPlacement='outside-top'
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                        {['purchase_price', 'wholesale_price', 'price', 'mrp'].map((field) => (
                            <Input
                                classNames={{
                                    inputWrapper: inputWrapperStyle,
                                }}
                                key={field}
                                label={
                                    field === 'purchase_price'
                                        ? 'Purchase'
                                        : field === 'wholesale_price'
                                          ? 'Wholesale'
                                          : field === 'price'
                                            ? 'Price'
                                            : 'MRP'
                                }
                                type='number'
                                placeholder='0'
                                startContent='₹'
                                isRequired
                                description={
                                    field === 'purchase_price'
                                        ? 'Cost price'
                                        : field === 'wholesale_price'
                                          ? 'Wholesale Price'
                                          : field === 'price'
                                            ? 'Retail price'
                                            : 'Online price'
                                }
                                size='sm'
                                value={(variant[field as keyof ProductVariant] ?? 0).toString()}
                                onChange={(e) =>
                                    updateVariant(index, {
                                        [field]: Number(e.target.value),
                                    })
                                }
                                labelPlacement='outside-top'
                            />
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value={`variants-${index}`} key={`variants-${index}`}>
                <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline'>
                    <span className='flex items-center gap-3'>
                        <HiColorSwatch size={20} />
                        <span>Color & Storage</span>
                    </span>
                </AccordionTrigger>

                <AccordionContent>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <Autocomplete
                            description='Select product color'
                            size='sm'
                            isLoading={colorsLoading}
                            labelPlacement='outside-top'
                            allowsCustomValue
                            onInputChange={onInputChange}
                            selectedKey={variant?.color?.name}
                            onSelectionChange={(key) => {
                                const selected = (filteredColors || []).find((c) => c.name === key)
                                if (selected) {
                                    updateVariant(index, {
                                        color: { name: selected.name, hex: selected.hex },
                                    })
                                }
                            }}
                            defaultItems={filteredColors || []}
                            popoverProps={{
                                classNames: {
                                    content: 'bg-background/80 backdrop-blur border shadow-none',
                                },
                            }}
                            label='Color'
                            placeholder='e.g., Black, Blue, Silver'
                            inputProps={{
                                classNames: {
                                    inputWrapper: inputWrapperStyle,
                                },
                            }}
                        >
                            {(c) => (
                                <AutocompleteItem key={c.name} textValue={c.name}>
                                    <div className='flex items-center gap-2'>
                                        <div
                                            className='size-4 rounded border'
                                            style={{ backgroundColor: c.hex }}
                                        />
                                        <span>{c.name}</span>
                                    </div>
                                </AutocompleteItem>
                            )}
                        </Autocomplete>

                        <Autocomplete
                            description='Select storage option'
                            size='sm'
                            defaultItems={storage || []}
                            popoverProps={{
                                classNames: {
                                    content: 'bg-background/80 backdrop-blur border shadow-none',
                                },
                            }}
                            selectedKey={variant?.storage}
                            onSelectionChange={(key) =>
                                updateVariant(index, { storage: key?.toString() ?? '' })
                            }
                            label='Storage'
                            placeholder='e.g., 8GB / 128GB'
                            labelPlacement='outside-top'
                            inputProps={{
                                classNames: {
                                    inputWrapper: inputWrapperStyle,
                                },
                            }}
                        >
                            {(s) => <AutocompleteItem key={s.name}>{s.name}</AutocompleteItem>}
                        </Autocomplete>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem key={`images-${index}`} value={`images-${index}`}>
                <AccordionTrigger className='py-2 text-[15px] leading-6 hover:no-underline'>
                    <span className='flex items-center gap-3'>
                        <GalleryHorizontalEnd size={20} />
                        <span>Product Images</span>
                    </span>
                </AccordionTrigger>

                <AccordionContent>
                    <div className='flex flex-wrap items-center gap-1.5'>
                        {variant?.image?.map((file, i) => (
                            <ImagePreview
                                key={i}
                                src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                                alt={`Image ${i + 1}`}
                                onRemove={() => {
                                    const newImgs = [...(variant?.image ?? [])]
                                    newImgs.splice(i, 1)
                                    updateVariant(index, { image: newImgs })
                                }}
                            />
                        ))}

                        {(variant?.image?.length ?? 0) < 3 && (
                            <Button
                                as='label'
                                className='aspect-square size-20 cursor-pointer border-2 border-dashed'
                                variant='light'
                            >
                                <BiImageAdd className='text-muted-foreground' size={30} />
                                <input
                                    type='file'
                                    accept='image/*'
                                    multiple
                                    hidden
                                    onChange={handleImageChange}
                                />
                            </Button>
                        )}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

const ImagePreview = ({
    src,
    alt,
    onRemove,
}: {
    src: string
    alt: string
    onRemove?: () => void
}) => (
    <div className='group relative shrink-0'>
        <Image
            alt={alt}
            className='size-20 border object-cover'
            classNames={{ wrapper: 'size-20 object-cover' }}
            src={src}
        />
        <Button
            isIconOnly
            className='absolute -top-0.5 -right-0.5 z-30 h-5 w-5 min-w-0 rounded-full p-0'
            onPress={onRemove}
        >
            <X className='size-4' />
        </Button>
    </div>
)
