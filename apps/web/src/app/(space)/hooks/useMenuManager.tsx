'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { toast } from '@heroui/react'

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
        toast.success('Renamed successfully!', {
            description: `"${item.name}" has been renamed to "${newName}"`,
        })

        const currentChildren = driveStore.children
        const updatedChildren = currentChildren.map((child) =>
            child.id === item.id ? { ...child, name: newName } : child
        )

        driveStore.setChildren(updatedChildren)
    }

    const handleRenameError = (error: string) => {
        toast.danger('Rename failed', { description: error })
    }

    const handleDeleteSuccess = (item: DriveItem) => {
        toast.success('Deleted successfully!', { description: `"${item.name}" has been deleted` })

        const currentChildren = driveStore.children
        const updatedChildren = currentChildren.filter((child) => child.id !== item.id)

        driveStore.setChildren(updatedChildren)
    }

    const handleDeleteError = (error: string) => {
        toast.danger('Delete failed', { description: error })
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



