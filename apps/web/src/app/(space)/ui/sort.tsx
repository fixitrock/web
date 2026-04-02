'use client'

import type { Selection } from '@heroui/react'

import {
    Button,
    Description,
    Dropdown,
    Header,
    Kbd,
    Label,
    ListBox,
    Separator,
} from '@heroui/react'
import { EllipsisVertical, ListFilter, Pencil, SquarePlus, Trash } from 'lucide-react'
import * as React from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { SortField, SortOrder } from '@/types/drive'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/ui/drawer'
import { ArrowSortDown, ArrowSortUp, SortAZ, SortDate, SortSize, SortType } from '@/ui/icons'

export function SortBy({ sort }: { sort: (sortField: SortField, sortOrder: SortOrder) => void }) {
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [sortField, setSortField] = React.useState<SortField>('name')
    const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc')
    const [isOpen, setOpen] = React.useState(false)

    const getSortByIcon = (field: SortField) => {
        switch (field) {
            case 'name':
                return <SortAZ />
            case 'type':
                return <SortType />
            case 'size':
                return <SortSize />
            case 'lastModifiedDateTime':
                return <SortDate />
            default:
                return null
        }
    }

    const handleFieldChange = (keys: Selection) => {
        const key = Array.from(keys)[0] as SortField | undefined
        if (!key) return

        setSortField(key)
        sort(key, sortOrder)

        if (!isDesktop) setOpen(false)
    }

    const handleOrderChange = (keys: Selection) => {
        const key = Array.from(keys)[0] as SortOrder | undefined
        if (!key) return

        setSortOrder(key)
        sort(sortField, key)

        if (!isDesktop) setOpen(false)
    }

    const trigger = (
        <Button isIconOnly size='sm' variant='tertiary'>
            <ListFilter size={20} />
        </Button>
    )

    return (
        <>
            {isDesktop ? (
                <Dropdown>
                    <Dropdown.Trigger aria-label='Menu' className='button button-md'>
                        <EllipsisVertical className='outline-none' />
                    </Dropdown.Trigger>
                    <Dropdown.Popover>
                        <Dropdown.Menu onAction={(key) => console.log(`Selected: ${key}`)}>
                            <Dropdown.Section>
                                <Header>Actions</Header>
                                <Dropdown.Item id='new-file' textValue='New file'>
                                    <div className='flex h-8 items-start justify-center pt-px'>
                                        <SquarePlus className='text-muted size-4 shrink-0' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <Label>New file</Label>
                                        <Description>Create a new file</Description>
                                    </div>
                                    <Kbd className='ms-auto' slot='keyboard' variant='light'>
                                        <Kbd.Abbr keyValue='command' />
                                        <Kbd.Content>N</Kbd.Content>
                                    </Kbd>
                                </Dropdown.Item>
                                <Dropdown.Item id='edit-file' textValue='Edit file'>
                                    <div className='flex h-8 items-start justify-center pt-px'>
                                        <Pencil className='text-muted size-4 shrink-0' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <Label>Edit file</Label>
                                        <Description>Make changes</Description>
                                    </div>
                                    <Kbd className='ms-auto' slot='keyboard' variant='light'>
                                        <Kbd.Abbr keyValue='command' />
                                        <Kbd.Content>E</Kbd.Content>
                                    </Kbd>
                                </Dropdown.Item>
                            </Dropdown.Section>
                            <Separator />
                            <Dropdown.Section>
                                <Header>Danger zone</Header>
                                <Dropdown.Item
                                    id='delete-file'
                                    textValue='Delete file'
                                    variant='danger'
                                >
                                    <div className='flex h-8 items-start justify-center pt-px'>
                                        <Trash className='text-danger size-4 shrink-0' />
                                    </div>
                                    <div className='flex flex-col'>
                                        <Label>Delete file</Label>
                                        <Description>Move to trash</Description>
                                    </div>
                                    <Kbd className='ms-auto' slot='keyboard' variant='light'>
                                        <Kbd.Abbr keyValue='command' />
                                        <Kbd.Abbr keyValue='shift' />
                                        <Kbd.Content>D</Kbd.Content>
                                    </Kbd>
                                </Dropdown.Item>
                            </Dropdown.Section>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            ) : (
                <Drawer open={isOpen} onOpenChange={setOpen}>
                    <DrawerTrigger asChild>{trigger}</DrawerTrigger>

                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>Sort Options</DrawerTitle>
                            <DrawerDescription>Select sorting preferences below.</DrawerDescription>
                        </DrawerHeader>

                        <div className='mb-2 space-y-4 px-2 pb-2'>
                            <ListBox
                                aria-label='Sort by'
                                selectedKeys={new Set([sortField])}
                                selectionMode='single'
                                onSelectionChange={handleFieldChange}
                            >
                                <ListBox.Section>
                                    <Header>Sort By</Header>

                                    <ListBox.Item id='name' textValue='Name'>
                                        <ListBox.ItemIndicator />
                                        {getSortByIcon('name')}
                                        <Label>Name</Label>
                                    </ListBox.Item>

                                    <ListBox.Item id='type' textValue='Type'>
                                        <ListBox.ItemIndicator />
                                        {getSortByIcon('type')}
                                        <Label>Type</Label>
                                    </ListBox.Item>

                                    <ListBox.Item id='size' textValue='Size'>
                                        <ListBox.ItemIndicator />
                                        {getSortByIcon('size')}
                                        <Label>Size</Label>
                                    </ListBox.Item>

                                    <ListBox.Item id='lastModifiedDateTime' textValue='Date'>
                                        <ListBox.ItemIndicator />
                                        {getSortByIcon('lastModifiedDateTime')}
                                        <Label>Date</Label>
                                    </ListBox.Item>
                                </ListBox.Section>
                            </ListBox>

                            <ListBox
                                aria-label='Sort order'
                                selectedKeys={new Set([sortOrder])}
                                selectionMode='single'
                                onSelectionChange={handleOrderChange}
                            >
                                <ListBox.Section>
                                    <Header>Order</Header>

                                    <ListBox.Item id='asc' textValue='Ascending'>
                                        <ListBox.ItemIndicator />
                                        <ArrowSortDown />
                                        <Label>Ascending</Label>
                                    </ListBox.Item>

                                    <ListBox.Item id='desc' textValue='Descending'>
                                        <ListBox.ItemIndicator />
                                        <ArrowSortUp />
                                        <Label>Descending</Label>
                                    </ListBox.Item>
                                </ListBox.Section>
                            </ListBox>
                        </div>
                    </DrawerContent>
                </Drawer>
            )}
        </>
    )
}
