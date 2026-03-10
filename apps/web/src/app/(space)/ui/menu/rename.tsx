'use client'

import * as React from 'react'
import { useActionState } from 'react'
import {
    Button,
    Modal,
    ModalContent,
    Input,
    ModalFooter,
    ModalHeader,
    ModalBody,
} from '@heroui/react'

import { canRename } from '@/actions/drive'
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
import Icon from '@/lib/utils/Icon'

interface RenameProps {
    item: DriveItem
    open: boolean
    onOpenChange: (open: boolean) => void
    currentPath: string
    onRenameSuccess?: (item: DriveItem, newName: string) => void
    onRenameError?: (error: string) => void
}

export function Rename({
    item,
    open,
    onOpenChange,
    currentPath,
    onRenameSuccess,
    onRenameError,
}: RenameProps) {
    const getFileNameParts = (name: string) => {
        if (item.folder) {
            return { nameWithoutExt: name, extension: '' }
        }
        const lastDotIndex = name.lastIndexOf('.')

        if (lastDotIndex === -1 || lastDotIndex === 0) {
            return { nameWithoutExt: name, extension: '' }
        }

        return {
            nameWithoutExt: name.substring(0, lastDotIndex),
            extension: name.substring(lastDotIndex),
        }
    }

    const { nameWithoutExt, extension } = getFileNameParts(item.name)
    const [newName, setNewName] = React.useState(nameWithoutExt)
    const [renameState, renameAction, isRenaming] = useActionState(canRename, { errors: {} })
    const processedStateRef = React.useRef<typeof renameState>(null)
    const isDesktop = useMediaQuery('(min-width: 768px)')

    React.useEffect(() => {
        if (
            open &&
            renameState &&
            processedStateRef.current !== renameState &&
            (renameState.success || Object.keys(renameState.errors || {}).length > 0)
        ) {
            if (renameState.success && renameState.message) {
                const fullNewName = newName.trim() + extension

                onRenameSuccess?.(item, fullNewName)
                onOpenChange(false)
                processedStateRef.current = renameState
            } else if (renameState.errors && Object.keys(renameState.errors).length > 0) {
                const errorMessage = Object.values(renameState.errors)[0] || 'Failed to rename item'

                onRenameError?.(errorMessage)
                processedStateRef.current = renameState
            }
        }
    }, [renameState, open, item, newName, extension, onRenameSuccess, onRenameError, onOpenChange])

    React.useEffect(() => {
        if (open) {
            const { nameWithoutExt } = getFileNameParts(item.name)

            setNewName(nameWithoutExt)
        }
    }, [open, item.name])

    if (isDesktop) {
        return (
            <Modal
                className='bg-background/80 border backdrop-blur'
                isOpen={open}
                shadow='none'
                size='md'
                onOpenChange={onOpenChange}
            >
                <form action={renameAction}>
                    <input name='itemId' type='hidden' value={item.id} />
                    <input name='currentPath' type='hidden' value={currentPath} />
                    <input name='extension' type='hidden' value={extension} />

                    <ModalContent>
                        <ModalHeader className='flex-col'>
                            <h3 className='text-foreground font-semibold'>
                                Rename {item.folder ? 'folder' : 'file'}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                                Enter a new name for{' '}
                                <span className='text-foreground'>"{item.name}"</span>
                            </p>
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                isRequired
                                endContent={
                                    extension && (
                                        <p className='text-muted-foreground'>{extension}</p>
                                    )
                                }
                                isDisabled={isRenaming}
                                name='newName'
                                placeholder={nameWithoutExt}
                                size='sm'
                                startContent={
                                    <Icon className='mx-auto size-5! shrink-0' name={item.name} />
                                }
                                value={newName}
                                onValueChange={setNewName}
                            />
                        </ModalBody>
                        <ModalFooter className='gap-4'>
                            <Button
                                fullWidth
                                className='bg-default/40'
                                isDisabled={isRenaming}
                                radius='full'
                                size='sm'
                                onPress={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                color='primary'
                                isDisabled={
                                    isRenaming ||
                                    !newName.trim() ||
                                    newName.trim() === nameWithoutExt
                                }
                                isLoading={isRenaming}
                                radius='full'
                                size='sm'
                                type='submit'
                            >
                                Rename
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
                <DrawerHeader>
                    <DrawerTitle>Rename {item.folder ? 'folder' : 'file'}</DrawerTitle>
                    <DrawerDescription>
                        Enter a new name for <span className='text-foreground'>"{item.name}"</span>
                    </DrawerDescription>
                </DrawerHeader>
                <form action={renameAction}>
                    <input name='itemId' type='hidden' value={item.id} />
                    <input name='currentPath' type='hidden' value={currentPath} />
                    <input name='extension' type='hidden' value={extension} />

                    <Input
                        autoFocus
                        isRequired
                        className='px-4'
                        endContent={
                            extension && <p className='text-muted-foreground'>{extension}</p>
                        }
                        isDisabled={isRenaming}
                        name='newName'
                        placeholder={nameWithoutExt}
                        size='sm'
                        startContent={
                            <Icon className='mx-auto size-5! shrink-0' name={item.name} />
                        }
                        value={newName}
                        onValueChange={setNewName}
                    />
                    <DrawerFooter className='flex-row gap-4'>
                        <Button
                            fullWidth
                            className='bg-default/40'
                            isDisabled={isRenaming}
                            radius='full'
                            size='sm'
                            onPress={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            fullWidth
                            color='primary'
                            isDisabled={
                                isRenaming || !newName.trim() || newName.trim() === nameWithoutExt
                            }
                            isLoading={isRenaming}
                            radius='full'
                            size='sm'
                            type='submit'
                        >
                            Rename
                        </Button>
                    </DrawerFooter>
                </form>
            </DrawerContent>
        </Drawer>
    )
}
