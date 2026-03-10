'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'

import { canDelete } from '@/actions/drive'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { DriveItem } from '@/types/drive'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/ui/drawer'
import { Delete as Icon } from '@/ui/icons'

interface DeleteProps {
    item: DriveItem
    open: boolean
    onOpenChange: (open: boolean) => void
    currentPath: string
    onDeleteSuccess?: (item: DriveItem) => void
    onDeleteError?: (error: string) => void
}

export function Delete({
    item,
    open,
    onOpenChange,
    currentPath,
    onDeleteSuccess,
    onDeleteError,
}: DeleteProps) {
    const [deleteState, deleteAction, isDeleting] = useActionState(canDelete, { errors: {} })
    const processedStateRef = React.useRef<typeof deleteState>(null)
    const isDesktop = useMediaQuery('(min-width: 768px)')

    React.useEffect(() => {
        if (
            open &&
            deleteState &&
            processedStateRef.current !== deleteState &&
            (deleteState.success || Object.keys(deleteState.errors || {}).length > 0)
        ) {
            if (deleteState.success && deleteState.message) {
                onDeleteSuccess?.(item)
                onOpenChange(false)
                processedStateRef.current = deleteState
            } else if (deleteState.errors && Object.keys(deleteState.errors).length > 0) {
                const errorMessage = Object.values(deleteState.errors)[0] || 'Failed to delete item'

                onDeleteError?.(errorMessage)
                processedStateRef.current = deleteState
            }
        }
    }, [deleteState, open, item, onDeleteSuccess, onDeleteError, onOpenChange])

    React.useEffect(() => {
        if (open) {
        }
    }, [open])

    if (isDesktop) {
        return (
            <Modal
                className='bg-background/80 border backdrop-blur'
                isOpen={open}
                shadow='none'
                size='md'
                onOpenChange={onOpenChange}
            >
                <form action={deleteAction}>
                    <input name='itemId' type='hidden' value={item.id} />
                    <input name='itemName' type='hidden' value={item.name} />
                    <input name='currentPath' type='hidden' value={currentPath} />
                    <ModalContent>
                        <ModalHeader className='text-muted-foreground mx-auto items-center text-center'>
                            <Icon className='text-danger size-20' />
                        </ModalHeader>
                        <ModalBody>
                            <h1 className='text-muted-foreground text-center text-balance'>
                                Are you sure you want to delete
                                <p className='text-foreground'>{item.name}</p>
                            </h1>
                        </ModalBody>
                        <ModalFooter className='gap-4'>
                            <Button
                                fullWidth
                                className='bg-default/40'
                                isDisabled={isDeleting}
                                radius='full'
                                size='sm'
                                onPress={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color='danger'
                                isDisabled={isDeleting}
                                isLoading={isDeleting}
                                radius='full'
                                size='sm'
                                type='submit'
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </form>
            </Modal>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader className='items-center text-center'>
                    <Icon className='text-danger size-20' />
                    <DrawerDescription>Are you sure you want to delete</DrawerDescription>
                    <DrawerTitle className='text-foreground'>{item.name}</DrawerTitle>
                </DrawerHeader>

                <form action={deleteAction}>
                    <input name='itemId' type='hidden' value={item.id} />
                    <input name='itemName' type='hidden' value={item.name} />
                    <input name='currentPath' type='hidden' value={currentPath} />
                    <DrawerFooter className='flex-row gap-4'>
                        <Button
                            fullWidth
                            className='bg-default/40'
                            isDisabled={isDeleting}
                            radius='full'
                            size='sm'
                            onPress={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            color='danger'
                            isDisabled={isDeleting}
                            isLoading={isDeleting}
                            radius='full'
                            size='sm'
                            type='submit'
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DrawerFooter>
                </form>
            </DrawerContent>
        </Drawer>
    )
}
