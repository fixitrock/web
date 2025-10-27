'use client'

import { storage } from '@/config/site'
import { useBrands, useCategories, useColors } from '@/hooks/tanstack/query'
import {
    Accordion,
    AccordionItem,
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
    useDisclosure,
    Image,
} from '@heroui/react'

import { CirclePlus, GalleryHorizontalEnd, Plus, Settings2, X } from 'lucide-react'
import { LuBadgeIndianRupee } from 'react-icons/lu'
import { BiImageAdd } from 'react-icons/bi'
import { HiColorSwatch } from 'react-icons/hi'
import { Delete } from '@/ui/icons'
import { useVariantsStore } from '@/zustand/store/variants'

type AddEditProps = {
    mode?: 'add' | 'edit'
}

export function AddProduct({ mode }: AddEditProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { data: cat, isLoading: catLoading } = useCategories()
    const { data, isLoading } = useBrands()
    const { filteredColors, colorsLoading, inputValue, onInputChange, onSelectionChange } =
        useColors()
    const { variants, addVariant, removeVariant, resetVariants } = useVariantsStore()
    const Title = mode === 'add' ? 'Add Product' : 'Edit Product'
    const Submit = mode === 'add' ? 'Add Product' : 'Update Product'
    const Icon = mode === 'add' ? <CirclePlus size={20} /> : <Settings2 size={20} />

    return (
        <>
            <Button
                onPress={onOpen}
                className='bg-background border'
                size='sm'
                startContent={<Plus className='size-4' aria-hidden='true' />}
            >
                Add Product
            </Button>

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
                                    classNames={{
                                        inputWrapper:
                                            'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                    }}
                                    size='sm'
                                    description='Enter product name'
                                />

                                <Autocomplete
                                    description='Select a category'
                                    size='sm'
                                    isLoading={catLoading}
                                    defaultItems={cat?.categories}
                                    popoverProps={{
                                        classNames: {
                                            content:
                                                'bg-background/80 backdrop-blur border shadow-none',
                                        },
                                    }}
                                    label='Category'
                                    placeholder='Choose category'
                                    isRequired
                                    labelPlacement='outside-top'
                                    allowsCustomValue
                                    inputProps={{
                                        classNames: {
                                            inputWrapper:
                                                'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                        },
                                    }}
                                    defaultFilter={(textValue, inputValue) => {
                                        const lowerTextValue = textValue.toLowerCase()
                                        const lowerInputValue = inputValue.toLowerCase()
                                        const category = cat?.categories?.find(
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
                                    {(c) => (
                                        <AutocompleteItem key={c.id}>{c.name}</AutocompleteItem>
                                    )}
                                </Autocomplete>
                            </div>

                            <Input
                                label='Compatibility'
                                placeholder='e.g., K20, K20 Pro, 9T, 9T Pro'
                                labelPlacement='outside-top'
                                isRequired
                                classNames={{
                                    inputWrapper:
                                        'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                }}
                                size='sm'
                                description='Supported models or devices'
                            />

                            <Textarea
                                classNames={{
                                    inputWrapper:
                                        'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                }}
                                labelPlacement='outside-top'
                                label='Description'
                                placeholder='e.g., Features, specifications, design, and highlights'
                                size='sm'
                                description='Brief product details'
                            />
                            {variants && variants.length <= 1 ? (
                                <div>
                                    <VariantForm
                                        key={'single'}
                                        index={0}
                                        colorsLoading={colorsLoading}
                                        inputValue={inputValue}
                                        onInputChange={onInputChange}
                                        onSelectionChange={onSelectionChange}
                                        filteredColors={filteredColors}
                                        isLoading={isLoading}
                                        brands={data?.brands}
                                    />

                                    <div className='flex items-center'>
                                        <div className='flex-1 border border-t' />
                                        <Button
                                            size='sm'
                                            variant='flat'
                                            color='success'
                                            className='rounded-full px-4 font-medium'
                                            startContent={<Plus size={16} />}
                                            onPress={() => addVariant()}
                                        >
                                            Add Variant
                                        </Button>
                                        <div className='flex-1 border border-t' />
                                    </div>
                                </div>
                            ) : (
                                <div className='space-y-2'>
                                    {variants.map((v, idx) => (
                                        <Accordion
                                            key={v.id}
                                            className='px-0'
                                            variant='splitted'
                                            itemClasses={{
                                                trigger: 'py-2',
                                                base: 'shadow-none bg-background border px-2.5',
                                                content: 'py-0',
                                            }}
                                            hideIndicator
                                            defaultSelectedKeys={[v.id]}
                                        >
                                            <AccordionItem
                                                classNames={{
                                                    title: 'flex items-center justify-between',
                                                }}
                                                title={
                                                    <>
                                                        <span> Variant {idx + 1}</span>
                                                        {idx === 0 ? (
                                                            <Button
                                                                color='primary'
                                                                variant='light'
                                                                startContent={<Plus />}
                                                                size='sm'
                                                                isIconOnly
                                                                onPress={() => addVariant()}
                                                            />
                                                        ) : (
                                                            <Button
                                                                color='danger'
                                                                variant='light'
                                                                startContent={<Delete />}
                                                                size='sm'
                                                                isIconOnly
                                                                onPress={() => removeVariant(v.id)}
                                                            />
                                                        )}
                                                    </>
                                                }
                                            >
                                                <VariantForm
                                                    key={v.id}
                                                    index={idx}
                                                    colorsLoading={colorsLoading}
                                                    inputValue={inputValue}
                                                    onInputChange={onInputChange}
                                                    onSelectionChange={onSelectionChange}
                                                    filteredColors={filteredColors}
                                                    isLoading={isLoading}
                                                    brands={data?.brands}
                                                />
                                            </AccordionItem>
                                        </Accordion>
                                    ))}
                                </div>
                            )}
                        </ScrollShadow>
                    </ModalBody>

                    <ModalFooter className='flex-row-reverse border-t p-2'>
                        <Button className='w-full' color='primary' radius='full' size='sm'>
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
        </>
    )
}

const ImagePreview = ({
    src,
    alt,
    onRemove,
    className = 'size-20',
}: {
    src: string
    alt: string
    onRemove?: () => void
    className?: string
}) => (
    <div className='group relative shrink-0'>
        <Image
            alt={alt}
            className={`${className} border object-cover`}
            classNames={{ wrapper: `${className} object-cover` }}
            src={src}
            onClick={onRemove}
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

const VariantForm = ({
    index,
    colorsLoading,
    inputValue,
    onInputChange,
    onSelectionChange,
    filteredColors,
    isLoading,
    brands,
}: {
    index: number
    colorsLoading: boolean
    inputValue: string
    onInputChange: (v: string) => void
    onSelectionChange: (v: any) => void
    filteredColors: any[]
    isLoading: boolean
    brands?: any[]
}) => (
    <Accordion
        className='px-0'
        defaultSelectedKeys={[`pricing-${index}`]}
        itemClasses={{ trigger: 'py-2' }}
    >
        <AccordionItem
            key={`pricing-${index}`}
            title={
                <span className='flex items-center gap-2'>
                    <LuBadgeIndianRupee size={20} /> Pricing & Stock
                </span>
            }
        >
            <div className='grid gap-4 md:grid-cols-2'>
                <Autocomplete
                    description='Select a brand'
                    size='sm'
                    isLoading={isLoading}
                    defaultItems={brands}
                    popoverProps={{
                        classNames: {
                            content: 'bg-background/80 backdrop-blur border shadow-none',
                        },
                    }}
                    label='Brand'
                    placeholder='Choose brand'
                    isRequired
                    labelPlacement='outside-top'
                    allowsCustomValue
                    inputProps={{
                        classNames: {
                            inputWrapper:
                                'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                        },
                    }}
                    defaultFilter={(textValue, inputValue) => {
                        const lowerTextValue = textValue.toLowerCase()
                        const lowerInputValue = inputValue.toLowerCase()
                        const brand = brands?.find((c) => c.name === textValue)
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
                    {(c) => <AutocompleteItem key={c.id}>{c.name}</AutocompleteItem>}
                </Autocomplete>

                <Input
                    classNames={{
                        inputWrapper:
                            'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                    }}
                    label='Quantity'
                    labelPlacement='outside-top'
                    isRequired
                    type='number'
                    placeholder='0'
                    description='Stock quantity'
                    size='sm'
                />
            </div>

            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                <Input
                    classNames={{
                        inputWrapper:
                            'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                    }}
                    label='Purchase'
                    labelPlacement='outside-top'
                    isRequired
                    type='number'
                    placeholder='100'
                    startContent='₹'
                    description='Cost price'
                    size='sm'
                />
                <Input
                    classNames={{
                        inputWrapper:
                            'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                    }}
                    label='Wholesale Price'
                    labelPlacement='outside-top'
                    isRequired
                    type='number'
                    placeholder='150'
                    startContent='₹'
                    description='Wholesale Price'
                    size='sm'
                />
                <Input
                    classNames={{
                        inputWrapper:
                            'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                    }}
                    label='Price'
                    labelPlacement='outside-top'
                    isRequired
                    type='number'
                    placeholder='250'
                    startContent='₹'
                    description='Retail price'
                    size='sm'
                />
                <Input
                    classNames={{
                        inputWrapper:
                            'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                    }}
                    label='MRP'
                    labelPlacement='outside-top'
                    isRequired
                    type='number'
                    placeholder='499'
                    startContent='₹'
                    description='Online price'
                    size='sm'
                />
            </div>
        </AccordionItem>

        <AccordionItem
            key={`variants-${index}`}
            title={
                <span className='flex items-center gap-2'>
                    <HiColorSwatch size={20} /> Color & Storage
                </span>
            }
        >
            <div className='grid gap-4 md:grid-cols-2'>
                <Autocomplete
                    description='Select product color'
                    size='sm'
                    isLoading={colorsLoading}
                    labelPlacement='outside-top'
                    allowsCustomValue
                    inputValue={inputValue}
                    onInputChange={onInputChange}
                    onSelectionChange={onSelectionChange}
                    defaultItems={filteredColors}
                    popoverProps={{
                        classNames: {
                            content: 'bg-background/80 backdrop-blur border shadow-none',
                        },
                    }}
                    label='Color'
                    placeholder='e.g., Black, Blue, Silver'
                    inputProps={{
                        classNames: {
                            inputWrapper:
                                'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
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
                    defaultItems={storage}
                    popoverProps={{
                        classNames: {
                            content: 'bg-background/80 backdrop-blur border shadow-none',
                        },
                    }}
                    label='Storage'
                    placeholder='e.g., 8GB / 128GB'
                    labelPlacement='outside-top'
                    inputProps={{
                        classNames: {
                            inputWrapper:
                                'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                        },
                    }}
                >
                    {(s) => <AutocompleteItem key={s.name}>{s.name}</AutocompleteItem>}
                </Autocomplete>
            </div>
        </AccordionItem>

        <AccordionItem
            key={`images-${index}`}
            title={
                <span className='flex items-center gap-2'>
                    <GalleryHorizontalEnd size={20} /> Product Images
                </span>
            }
        >
            <div className='flex items-center gap-1.5'>
                <ImagePreview
                    src='https://cdna.iconscout.com/img/3d-hero-card.0de68bd.png'
                    alt='Product preview'
                />
                <Button className='aspect-square size-20 border-2 border-dashed' variant='light'>
                    <BiImageAdd className='text-muted-foreground' size={30} />
                </Button>
            </div>
        </AccordionItem>
    </Accordion>
)


