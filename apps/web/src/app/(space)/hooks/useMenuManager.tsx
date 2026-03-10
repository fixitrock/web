'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { addToast } from '@heroui/react'

import { DriveItem } from '@/types/drive'
import { useDriveStore } from '@/zustand/store'

import { Rename } from '../ui/menu/rename'
import { Delete } from '../ui/menu/delete'

export function useMenuManager() {
    const [renameDialogOpen, setRenameDialogOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [currentItem, setCurrentItem] = React.useState<DriveItem | null>(null)
    const path = usePathname()
    const driveStore = useDriveStore()

    const handleRename = (item: DriveItem) => {
        setCurrentItem(item)
        setRenameDialogOpen(true)
    }

    const handleDelete = (item: DriveItem) => {
        setCurrentItem(item)
        setDeleteDialogOpen(true)
    }

    const handleRenameSuccess = (item: DriveItem, newName: string) => {
        addToast({
            title: 'Renamed successfully!',
            description: `"${item.name}" has been renamed to "${newName}"`,
            color: 'success',
        })

        const currentChildren = driveStore.children
        const updatedChildren = currentChildren.map((child) =>
            child.id === item.id ? { ...child, name: newName } : child
        )

        driveStore.setChildren(updatedChildren)
    }

    const handleRenameError = (error: string) => {
        addToast({
            title: 'Rename failed',
            description: error,
            color: 'danger',
        })
    }

    const handleDeleteSuccess = (item: DriveItem) => {
        addToast({
            title: 'Deleted successfully!',
            description: `"${item.name}" has been deleted`,
            color: 'success',
        })

        const currentChildren = driveStore.children
        const updatedChildren = currentChildren.filter((child) => child.id !== item.id)

        driveStore.setChildren(updatedChildren)
    }

    const handleDeleteError = (error: string) => {
        addToast({
            title: 'Delete failed',
            description: error,
            color: 'danger',
        })
    }

    const menuManager = () =>
        currentItem && (
            <>
                <Rename
                    currentPath={path}
                    item={currentItem}
                    open={renameDialogOpen}
                    onOpenChange={setRenameDialogOpen}
                    onRenameError={handleRenameError}
                    onRenameSuccess={handleRenameSuccess}
                />

                <Delete
                    currentPath={path}
                    item={currentItem}
                    open={deleteDialogOpen}
                    onDeleteError={handleDeleteError}
                    onDeleteSuccess={handleDeleteSuccess}
                    onOpenChange={setDeleteDialogOpen}
                />
            </>
        )

    return {
        handleRename,
        handleDelete,
        menuManager,
    }
}
