'use client'

import React, { useRef, useState } from 'react'
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    addToast,
} from '@heroui/react'
import { Camera, ImagePlus, Trash2, X } from 'lucide-react'

import { Drawer, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle } from '@/ui/drawer'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
    updateSelfAvatar,
    updateSelfCover,
    removeSelfAvatar,
    removeSelfCover,
} from '@/actions/users'

interface AddProps {
    isOpen: boolean
    onClose: () => void
    onOpenChange: (open: boolean) => void
    mode: 'avatar' | 'cover'
}

export default function AvatarCover({ isOpen, onClose, onOpenChange, mode }: AddProps) {
    const isDesktop = useMediaQuery('(min-width: 786px)')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)

    const title = mode === 'avatar' ? 'Avatar Change' : 'Cover Change'
    const deleteText = mode === 'avatar' ? 'Remove Avatar' : 'Remove Cover'

    // Detect platform
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )

    const handleFileUpload = async (file: File) => {
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            addToast({
                title: 'Invalid file type',
                description: 'Please select an image file',
                color: 'danger',
            })

            return
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024 // 5MB

        if (file.size > maxSize) {
            addToast({
                title: 'File too large',
                description: 'Please select an image smaller than 5MB',
                color: 'danger',
            })

            return
        }

        setIsLoading(true)

        try {
            const uploadAction = mode === 'avatar' ? updateSelfAvatar : updateSelfCover

            await uploadAction(file)

            addToast({
                title: `${mode === 'avatar' ? 'Avatar' : 'Cover'} updated successfully!`,
                color: 'success',
            })

            onClose()
        } catch (error) {
            addToast({
                title: `Failed to update ${mode}`,
                description: error instanceof Error ? error.message : 'Please try again',
                color: 'danger',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCamera = () => {
        // For mobile devices, use the default camera app
        if (isMobile) {
            cameraInputRef.current?.click()

            return
        }

        // For desktop, use the default camera app without fallback
        if (isDesktop) {
            cameraInputRef.current?.click()
        }
    }

    const handleGallery = () => {
        fileInputRef.current?.click()
    }

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (file) {
            await handleFileUpload(file)
        }
        // Reset input value to allow selecting the same file again
        e.target.value = ''
    }

    const handleCameraInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (file) {
            await handleFileUpload(file)
        }
        // Reset input value to allow selecting the same file again
        e.target.value = ''
    }

    const handleRemove = async () => {
        setIsLoading(true)

        try {
            const removeAction = mode === 'avatar' ? removeSelfAvatar : removeSelfCover

            await removeAction()

            addToast({
                title: `${mode === 'avatar' ? 'Avatar' : 'Cover'} removed successfully!`,
                color: 'success',
            })

            onClose()
        } catch (error) {
            addToast({
                title: `Failed to remove ${mode}`,
                description: error instanceof Error ? error.message : 'Please try again',
                color: 'danger',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isDesktop) {
        return (
            <Modal
                hideCloseButton
                className='border dark:bg-[#0a0a0a]'
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                    <ModalHeader className='flex-1 items-center justify-between rounded-t-xl border-b bg-gray-50 select-none dark:bg-zinc-900'>
                        <p className='flex items-center gap-2 text-lg font-semibold'>{title}</p>
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
                    <ModalBody className='flex-row py-4'>
                        <Button
                            isIconOnly
                            className='text-muted-foreground hover:text-foreground size-20 rounded-full border'
                            isDisabled={isLoading}
                            startContent={<Camera size={35} />}
                            variant='light'
                            onPress={handleCamera}
                        />
                        <Button
                            isIconOnly
                            className='text-muted-foreground hover:text-foreground size-20 rounded-full border'
                            isDisabled={isLoading}
                            startContent={<ImagePlus size={35} />}
                            variant='light'
                            onPress={handleGallery}
                        />
                        <input
                            ref={fileInputRef}
                            accept='image/*'
                            style={{ display: 'none' }}
                            type='file'
                            onChange={handleFileInputChange}
                        />
                        <input
                            ref={cameraInputRef}
                            accept='image/*'
                            capture={isMobile ? 'user' : undefined}
                            style={{ display: 'none' }}
                            type='file'
                            onChange={handleCameraInputChange}
                        />
                    </ModalBody>
                    <ModalFooter className='flex-row-reverse gap-2 border-t'>
                        <Button
                            fullWidth
                            className='font-semibold'
                            color='danger'
                            isLoading={isLoading}
                            radius='full'
                            startContent={<Trash2 size={20} />}
                            onPress={handleRemove}
                        >
                            {deleteText}
                        </Button>
                        <Button
                            className='w-full border font-medium'
                            isDisabled={isLoading}
                            radius='full'
                            type='button'
                            variant='light'
                            onPress={onClose}
                        >
                            Cancel / रद्द करें
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader className='border-b pt-0'>
                    <DrawerTitle className='flex items-center justify-between'>
                        <p className='text-lg font-semibold'>{title}</p>
                        <Button
                            isIconOnly
                            aria-label='Close drawer'
                            className='border'
                            radius='full'
                            size='sm'
                            startContent={<X size={18} />}
                            variant='light'
                            onPress={onClose}
                        />
                    </DrawerTitle>
                </DrawerHeader>
                <div className='flex flex-row gap-4 p-4'>
                    <Button
                        isIconOnly
                        className='text-muted-foreground hover:text-foreground size-20 rounded-full border'
                        isDisabled={isLoading}
                        startContent={<Camera size={35} />}
                        variant='light'
                        onPress={handleCamera}
                    />
                    <Button
                        isIconOnly
                        className='text-muted-foreground hover:text-foreground size-20 rounded-full border'
                        isDisabled={isLoading}
                        startContent={<ImagePlus size={35} />}
                        variant='light'
                        onPress={handleGallery}
                    />
                    <input
                        ref={fileInputRef}
                        accept='image/*'
                        style={{ display: 'none' }}
                        type='file'
                        onChange={handleFileInputChange}
                    />
                    <input
                        ref={cameraInputRef}
                        accept='image/*'
                        capture={isMobile ? 'user' : undefined}
                        style={{ display: 'none' }}
                        type='file'
                        onChange={handleCameraInputChange}
                    />
                </div>
                <DrawerFooter className='flex-row-reverse gap-4 border-t'>
                    <Button
                        fullWidth
                        className='font-semibold'
                        color='danger'
                        isLoading={isLoading}
                        radius='full'
                        startContent={<Trash2 size={20} />}
                        onPress={handleRemove}
                    >
                        {deleteText}
                    </Button>
                    <Button
                        className='w-full border font-medium'
                        isDisabled={isLoading}
                        radius='full'
                        type='button'
                        variant='light'
                        onPress={onClose}
                    >
                        Cancel / रद्द करें
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
