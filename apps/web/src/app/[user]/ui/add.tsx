'use client'

import React, { useRef, useState } from 'react'
import { Button, Modal, toast } from '@heroui/react'
import { Camera, ImagePlus, Trash2, X } from 'lucide-react'

import {
    removeSelfAvatar,
    removeSelfCover,
    updateSelfAvatar,
    updateSelfCover,
} from '@/actions/users'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/drawer'

interface AddProps {
    isOpen: boolean
    onClose: () => void
    onOpenChange: (open: boolean) => void
    mode: 'avatar' | 'cover'
    userUpdatedAt?: string
}

function ActionButton({
    icon,
    label,
    disabled,
    onPress,
}: {
    icon: React.ReactNode
    label: string
    disabled?: boolean
    onPress: () => void
}) {
    return (
        <Button
            isIconOnly
            aria-label={label}
            className='text-muted-foreground hover:text-foreground size-20 rounded-full border'
            isDisabled={disabled}
            variant='ghost'
            onPress={onPress}
        >
            {icon}
        </Button>
    )
}

export default function AvatarCover({
    isOpen,
    onClose,
    onOpenChange,
    mode,
    userUpdatedAt,
}: AddProps) {
    const isDesktop = useMediaQuery('(min-width: 786px)')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const currentUpdatedAtRef = useRef<string | undefined>(userUpdatedAt)
    const [isLoading, setIsLoading] = useState(false)

    const title = mode === 'avatar' ? 'Avatar Change' : 'Cover Change'
    const deleteText = mode === 'avatar' ? 'Remove Avatar' : 'Remove Cover'

    if (userUpdatedAt && currentUpdatedAtRef.current !== userUpdatedAt) {
        currentUpdatedAtRef.current = userUpdatedAt
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )

    const closeAndReset = () => {
        onOpenChange(false)
        onClose()
    }

    const handleFileUpload = async (file: File) => {
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.danger('Invalid file type', {
                description: 'Please select an image file',
            })

            return
        }

        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            toast.danger('File too large', {
                description: 'Please select an image smaller than 5MB',
            })

            return
        }

        setIsLoading(true)

        try {
            const uploadAction = mode === 'avatar' ? updateSelfAvatar : updateSelfCover
            const result = await uploadAction(file, currentUpdatedAtRef.current)

            if (result?.updatedAt) {
                currentUpdatedAtRef.current = result.updatedAt
            }

            toast.success(`${mode === 'avatar' ? 'Avatar' : 'Cover'} updated successfully!`)
            closeAndReset()
        } catch (error) {
            toast.danger(`Failed to update ${mode}`, {
                description: error instanceof Error ? error.message : 'Please try again',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCamera = () => {
        if (isMobile || isDesktop) {
            cameraInputRef.current?.click()
        }
    }

    const handleGallery = () => {
        fileInputRef.current?.click()
    }

    const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (file) {
            await handleFileUpload(file)
        }

        event.target.value = ''
    }

    const handleCameraInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (file) {
            await handleFileUpload(file)
        }

        event.target.value = ''
    }

    const handleRemove = async () => {
        setIsLoading(true)

        try {
            const removeAction = mode === 'avatar' ? removeSelfAvatar : removeSelfCover
            const result = await removeAction(currentUpdatedAtRef.current)

            if (result?.updatedAt) {
                currentUpdatedAtRef.current = result.updatedAt
            }

            toast.success(`${mode === 'avatar' ? 'Avatar' : 'Cover'} removed successfully!`)
            closeAndReset()
        } catch (error) {
            toast.danger(`Failed to remove ${mode}`, {
                description: error instanceof Error ? error.message : 'Please try again',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const hiddenInputs = (
        <>
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
        </>
    )

    const actions = (
        <div className='flex flex-row gap-4 py-4'>
            <ActionButton
                disabled={isLoading}
                icon={<Camera size={35} />}
                label='Use camera'
                onPress={handleCamera}
            />
            <ActionButton
                disabled={isLoading}
                icon={<ImagePlus size={35} />}
                label='Choose from gallery'
                onPress={handleGallery}
            />
            {hiddenInputs}
        </div>
    )

    if (isDesktop) {
        return (
            <Modal>
                <Modal.Backdrop isOpen={isOpen} variant='blur' onOpenChange={onOpenChange}>
                    <Modal.Container className='rounded-[20px] border bg-background/95 backdrop-blur' size='md'>
                        <Modal.Dialog>
                            <Modal.Header className='items-center justify-between border-b'>
                                <Modal.Heading>{title}</Modal.Heading>
                                <Button
                                    isIconOnly
                                    aria-label='Close modal'
                                    className='rounded-full border'
                                    size='sm'
                                    variant='ghost'
                                    onPress={closeAndReset}
                                >
                                    <X size={18} />
                                </Button>
                            </Modal.Header>
                            <Modal.Body>{actions}</Modal.Body>
                            <Modal.Footer className='flex-row-reverse gap-2 border-t'>
                                <Button
                                    fullWidth
                                    isPending={isLoading}
                                    size='sm'
                                    variant='danger'
                                    onPress={handleRemove}
                                >
                                    <Trash2 size={18} />
                                    {deleteText}
                                </Button>
                                <Button
                                    fullWidth
                                    isDisabled={isLoading}
                                    size='sm'
                                    variant='secondary'
                                    onPress={closeAndReset}
                                >
                                    Cancel
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
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
                            className='rounded-full border'
                            size='sm'
                            variant='ghost'
                            onPress={closeAndReset}
                        >
                            <X size={18} />
                        </Button>
                    </DrawerTitle>
                </DrawerHeader>
                <div className='px-4'>{actions}</div>
                <DrawerFooter className='flex-row-reverse gap-4 border-t'>
                    <Button
                        fullWidth
                        isPending={isLoading}
                        size='sm'
                        variant='danger'
                        onPress={handleRemove}
                    >
                        <Trash2 size={18} />
                        {deleteText}
                    </Button>
                    <Button
                        fullWidth
                        isDisabled={isLoading}
                        size='sm'
                        variant='secondary'
                        onPress={closeAndReset}
                    >
                        Cancel
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
