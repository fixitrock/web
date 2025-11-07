'use client'

import {
    Button,
    Chip,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
    Image,
    ScrollShadow,
} from '@heroui/react'
import { CirclePlus, Eye, Plus, Settings2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCreateCategory, useUpdateCategory } from '@/hooks/tanstack/mutation'
import { useCategoryStore } from '@/zustand/store'
import { AnimatePresence, motion } from 'framer-motion'
import { bucketUrl } from '@/supabase/bucket'

interface AddEditProps {
    isOpen: boolean
    onClose: () => void
    type: 'add' | 'edit'
}
export default function AddEdit({ isOpen, onClose, type }: AddEditProps) {
    const { form, updateForm, resetForm, editingCategory } = useCategoryStore()
    const { mutateAsync: createMutate, isPending: isCreating } = useCreateCategory()
    const { mutateAsync: updateMutate, isPending: isUpdating } = useUpdateCategory()

    const [keywordInput, setKeywordInput] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')

    useEffect(() => {
        if (form.imageUrl && form.imageUrl.trim() !== '') {
            if (form.imageUrl.startsWith('http://') || form.imageUrl.startsWith('https://')) {
                setPreviewUrl(form.imageUrl)
            } else {
                setPreviewUrl(`${bucketUrl(form.imageUrl)}?v=${form.updated_at}`) 
            }
        } else {
            setPreviewUrl('')
        }
    }, [form.imageUrl])
    const handleSubmit = async () => {
        try {
            if (type === 'add') {
                await createMutate({
                    name: form.name!,
                    description: form.description!,
                    keywords: form.keywords || [],
                    imageUrl: form.imageUrl || '',
                })
            } else if (type === 'edit' && editingCategory) {
                await updateMutate({
                    ...editingCategory,
                    name: form.name!,
                    description: form.description!,
                    keywords: form.keywords || [],
                    imageUrl: form.imageUrl || '',
                })
            }

            resetForm()
            onClose()
        } catch (err) {
            console.error(err)
        }
    }
    const Title = type === 'add' ? 'Add Category' : 'Edit Category'
    const Submit = type === 'add' ? 'Add Category' : 'Update Category'
    const Icon = type === 'add' ? <CirclePlus size={20} /> : <Settings2 size={20} />
    return (
        <Modal
            hideCloseButton
            className='bg-background max-h-[50vh] border shadow-none backdrop-blur'
            isOpen={isOpen}
            placement='center'
            scrollBehavior='inside'
            onClose={() => {
                resetForm()
                onClose()
            }}
        >
            <ModalContent className='overflow-hidden'>
                <ModalHeader className='flex-1 items-center justify-between rounded-t-xl border-b p-2 select-none'>
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
                        onPress={() => {
                            resetForm()
                            onClose()
                        }}
                    />
                </ModalHeader>

                <ModalBody className='p-0'>
                    <ScrollShadow className='flex flex-col gap-3 px-3 py-2'>
                        <Input
                            size='sm'
                            classNames={{
                                inputWrapper:
                                    'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                            }}
                            label='Name'
                            labelPlacement='outside'
                            placeholder='e.g., Display'
                            value={form.name || ''}
                            onChange={(e) => updateForm({ name: e.target.value })}
                            isRequired
                        />

                        <div className='space-y-2'>
                            <Input
                                classNames={{
                                    inputWrapper:
                                        'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                }}
                                size='sm'
                                label='Keywords'
                                labelPlacement='outside'
                                placeholder='Add keyword and press enter'
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && keywordInput.trim()) {
                                        e.preventDefault()
                                        updateForm({
                                            keywords: [
                                                ...(form.keywords || []),
                                                keywordInput.trim(),
                                            ],
                                        })
                                        setKeywordInput('')
                                    }
                                }}
                                endContent={
                                    <Button
                                        radius='full'
                                        size='sm'
                                        isDisabled={!keywordInput.trim()}
                                        className='size-6 min-h-auto min-w-auto shrink-0 items-center p-0'
                                        startContent={<Plus size={18} />}
                                        onPress={() => {
                                            if (keywordInput.trim()) {
                                                updateForm({
                                                    keywords: [
                                                        ...(form.keywords || []),
                                                        keywordInput.trim(),
                                                    ],
                                                })
                                                setKeywordInput('')
                                            }
                                        }}
                                    />
                                }
                            />

                            {form.keywords && (
                                <motion.div
                                    className='flex flex-wrap gap-1'
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    <AnimatePresence>
                                        {form.keywords.map((kw) => (
                                            <motion.div
                                                key={kw}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8, y: -5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.8, y: 0 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 500,
                                                    damping: 30,
                                                }}
                                            >
                                                <Chip
                                                    variant='flat'
                                                    onClose={() =>
                                                        updateForm({
                                                            keywords: form.keywords?.filter(
                                                                (k) => k !== kw
                                                            ),
                                                        })
                                                    }
                                                >
                                                    {kw}
                                                </Chip>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </div>
                        <Textarea
                            size='sm'
                            classNames={{
                                inputWrapper:
                                    'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                            }}
                            label='Description'
                            labelPlacement='outside'
                            placeholder='Describe this category...'
                            value={form.description || ''}
                            onChange={(e) => updateForm({ description: e.target.value })}
                        />
                        <div className='space-y-2'>
                            <Input
                                classNames={{
                                    inputWrapper:
                                        'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                                }}
                                size='sm'
                                label='Image URL'
                                labelPlacement='outside'
                                placeholder='Enter image URL (e.g. https://fixitrock.com/icon.png)'
                                value={form.imageUrl || ''}
                                onChange={(e) => updateForm({ imageUrl: e.target.value })}
                            />
                            {previewUrl && (
                                <ImagePreview
                                    src={previewUrl}
                                    alt={form.name || 'Category image'}
                                    onRemove={() => updateForm({ imageUrl: '' })}
                                />
                            )}
                        </div>
                    </ScrollShadow>
                </ModalBody>

                <ModalFooter className='flex-row-reverse border-t p-2'>
                    <Button
                        className='w-full'
                        color='primary'
                        isLoading={isCreating || isUpdating}
                        radius='full'
                        onPress={handleSubmit}
                        size='sm'
                    >
                        {Submit}
                    </Button>
                    <Button
                        className='w-full border'
                        radius='full'
                        variant='light'
                        size='sm'
                        onPress={() => {
                            resetForm()
                            onClose()
                        }}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
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
}) => {
    return (
        <div className='mt-2 space-y-4 select-none'>
            <h3 className='flex items-center gap-2 leading-none font-semibold'>
                <Eye className='h-5 w-5' />
                Live Preview
            </h3>
            <div className='group bg-default/10 relative flex items-center justify-center gap-8 rounded-2xl border-2 border-dashed p-4 md:gap-10 md:p-8'>
                <div className='flex flex-col items-center gap-1.5'>
                    <Image
                        alt={alt}
                        className='mx-auto items-center rounded-md border bg-white object-contain'
                        height={100}
                        src={src || '/fallback.png'}
                        width={100}
                    />
                    <p className='text-muted-foreground'>Light Mode</p>
                </div>
                <div className='flex flex-col items-center gap-1.5'>
                    <Image
                        alt={alt}
                        className='mx-auto items-center rounded-md border bg-black object-contain'
                        height={100}
                        src={src || '/fallback.png'}
                        width={100}
                    />
                    <p className='text-muted-foreground'>Dark Mode</p>
                </div>
                <Button
                    isIconOnly
                    aria-label='Remove image'
                    className='absolute top-1.5 right-1.5 z-30 h-5 w-5 min-w-0 rounded-full p-0 opacity-0 group-hover:opacity-100'
                    onPress={onRemove}
                >
                    <X className='size-4' />
                </Button>
            </div>
        </div>
    )
}