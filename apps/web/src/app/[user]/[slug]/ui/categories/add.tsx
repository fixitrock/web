'use client'

import Image from 'next/image'
import { Button, Chip, InputGroup, Label, Modal, ScrollShadow, TextField } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { CirclePlus, Eye, Plus, Settings2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useCreateCategory, useUpdateCategory } from '@/hooks/tanstack/mutation'
import { bucketUrl } from '@/supabase/bucket'
import { useCategoryStore } from '@/zustand/store'

interface AddEditProps {
    isOpen: boolean
    onClose: () => void
    type: 'add' | 'edit'
}

const FIELD_GROUP_CLASS =
    'bg-default/20 transition-colors hover:bg-default/25 focus-within:bg-default/25'

function Field({
    label,
    value,
    placeholder,
    required = false,
    onChange,
    suffix,
}: {
    label: string
    value: string
    placeholder: string
    required?: boolean
    onChange: (value: string) => void
    suffix?: React.ReactNode
}) {
    return (
        <TextField isRequired={required}>
            <Label>{label}</Label>
            <InputGroup className={FIELD_GROUP_CLASS}>
                <InputGroup.Input
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
                {suffix ? <InputGroup.Suffix>{suffix}</InputGroup.Suffix> : null}
            </InputGroup>
        </TextField>
    )
}

function TextAreaField({
    label,
    value,
    placeholder,
    onChange,
}: {
    label: string
    value: string
    placeholder: string
    onChange: (value: string) => void
}) {
    return (
        <TextField>
            <Label>{label}</Label>
            <InputGroup className={FIELD_GROUP_CLASS}>
                <InputGroup.TextArea
                    placeholder={placeholder}
                    rows={4}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </InputGroup>
        </TextField>
    )
}

function KeywordChip({ keyword, onRemove }: { keyword: string; onRemove: () => void }) {
    return (
        <div className='inline-flex items-center gap-1 rounded-full border pr-1'>
            <Chip variant='secondary'>
                <Chip.Label>{keyword}</Chip.Label>
            </Chip>
            <Button
                isIconOnly
                aria-label={`Remove ${keyword}`}
                className='size-6 min-w-0 rounded-full'
                size='sm'
                variant='ghost'
                onPress={onRemove}
            >
                <X size={14} />
            </Button>
        </div>
    )
}

export default function AddEdit({ isOpen, onClose, type }: AddEditProps) {
    const { form, updateForm, resetForm, editingCategory } = useCategoryStore()
    const { mutateAsync: createMutate, isPending: isCreating } = useCreateCategory()
    const { mutateAsync: updateMutate, isPending: isUpdating } = useUpdateCategory()
    const [keywordInput, setKeywordInput] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')

    const title = type === 'add' ? 'Add Category' : 'Edit Category'
    const submitLabel = type === 'add' ? 'Add Category' : 'Update Category'
    const icon = type === 'add' ? <CirclePlus size={20} /> : <Settings2 size={20} />
    const isPending = isCreating || isUpdating

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
    }, [form.imageUrl, form.updated_at])

    const keywords = useMemo(() => form.keywords || [], [form.keywords])

    const handleClose = () => {
        resetForm()
        setKeywordInput('')
        onClose()
    }

    const addKeyword = () => {
        const value = keywordInput.trim()

        if (!value) return
        if (keywords.includes(value)) {
            setKeywordInput('')

            return
        }

        updateForm({ keywords: [...keywords, value] })
        setKeywordInput('')
    }

    const removeKeyword = (keyword: string) => {
        updateForm({ keywords: keywords.filter((entry) => entry !== keyword) })
    }

    const handleSubmit = async () => {
        try {
            if (type === 'add') {
                await createMutate({
                    name: form.name || '',
                    description: form.description || '',
                    keywords,
                    imageUrl: form.imageUrl || '',
                })
            } else if (type === 'edit' && editingCategory) {
                await updateMutate({
                    ...editingCategory,
                    name: form.name || '',
                    description: form.description || '',
                    keywords,
                    imageUrl: form.imageUrl || '',
                })
            }

            handleClose()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Modal>
            <Modal.Backdrop isOpen={isOpen} variant='blur' onOpenChange={(open) => !open && handleClose()}>
                <Modal.Container
                    className='rounded-[20px] border bg-background/95 backdrop-blur'
                    placement='center'
                    scroll='inside'
                    size='lg'
                >
                    <Modal.Dialog>
                        <form
                            onSubmit={async (event) => {
                                event.preventDefault()
                                await handleSubmit()
                            }}
                        >
                            <Modal.Header className='items-center justify-between border-b p-3'>
                                <div className='flex items-center gap-2 text-lg font-semibold'>
                                    {icon}
                                    <span>{title}</span>
                                </div>
                                <Button
                                    isIconOnly
                                    aria-label='Close modal'
                                    className='rounded-full border'
                                    size='sm'
                                    variant='ghost'
                                    onPress={handleClose}
                                >
                                    <X size={18} />
                                </Button>
                            </Modal.Header>

                            <Modal.Body className='p-0'>
                                <ScrollShadow className='flex max-h-[65vh] flex-col gap-4 px-4 py-3'>
                                    <Field
                                        label='Name'
                                        placeholder='e.g., Display'
                                        required
                                        value={form.name || ''}
                                        onChange={(value) => updateForm({ name: value })}
                                    />

                                    <TextField>
                                        <Label>Keywords</Label>
                                        <InputGroup className={FIELD_GROUP_CLASS}>
                                            <InputGroup.Input
                                                placeholder='Add keyword and press enter'
                                                value={keywordInput}
                                                onChange={(event) => setKeywordInput(event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        event.preventDefault()
                                                        addKeyword()
                                                    }
                                                }}
                                            />
                                            <InputGroup.Suffix>
                                                <Button
                                                    isIconOnly
                                                    aria-label='Add keyword'
                                                    className='size-7 min-w-0 rounded-full'
                                                    isDisabled={!keywordInput.trim()}
                                                    size='sm'
                                                    variant='secondary'
                                                    onPress={addKeyword}
                                                >
                                                    <Plus size={18} />
                                                </Button>
                                            </InputGroup.Suffix>
                                        </InputGroup>
                                    </TextField>

                                    {keywords.length ? (
                                        <motion.div
                                            className='flex flex-wrap gap-2'
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        >
                                            <AnimatePresence>
                                                {keywords.map((keyword) => (
                                                    <motion.div
                                                        key={keyword}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8, y: -5 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.8, y: 0 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                    >
                                                        <KeywordChip
                                                            keyword={keyword}
                                                            onRemove={() => removeKeyword(keyword)}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </motion.div>
                                    ) : null}

                                    <TextAreaField
                                        label='Description'
                                        placeholder='Describe this category...'
                                        value={form.description || ''}
                                        onChange={(value) => updateForm({ description: value })}
                                    />

                                    <Field
                                        label='Image URL'
                                        placeholder='Enter image URL (e.g. https://fixitrock.com/icon.png)'
                                        value={form.imageUrl || ''}
                                        onChange={(value) => updateForm({ imageUrl: value })}
                                    />

                                    {previewUrl ? (
                                        <ImagePreview
                                            alt={form.name || 'Category image'}
                                            src={previewUrl}
                                            onRemove={() => updateForm({ imageUrl: '' })}
                                        />
                                    ) : null}
                                </ScrollShadow>
                            </Modal.Body>

                            <Modal.Footer className='flex-row-reverse gap-2 border-t p-3'>
                                <Button fullWidth isPending={isPending} size='sm' type='submit' variant='primary'>
                                    {submitLabel}
                                </Button>
                                <Button fullWidth size='sm' variant='secondary' onPress={handleClose}>
                                    Cancel
                                </Button>
                            </Modal.Footer>
                        </form>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
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

