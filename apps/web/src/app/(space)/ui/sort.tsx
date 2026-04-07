'use client'

import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Listbox,
    ListboxItem,
    ListboxSection,
} from '@heroui/react'
import { ListFilter } from 'lucide-react'
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
    const handleSelectionChange = (key: string) => {
        if (key === 'asc' || key === 'desc') {
            setSortOrder(key as SortOrder)
            sort(sortField, key as SortOrder)
        } else {
            setSortField(key as SortField)
            sort(key as SortField, sortOrder)
        }
        if (!isDesktop) {
            setOpen(false)
        }
    }

    return (
        <>
            {isDesktop ? (
                <Dropdown
                    className='rounded-lg border shadow-none'
                    placement='bottom-end'
                    radius='none'
                    type='listbox'
                >
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            className='h-8 w-8 min-w-0 p-0'
                            radius='full'
                            size='sm'
                            startContent={<ListFilter size={20} />}
                            variant='light'
                        />
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label='Sort Options'
                        selectedKeys={[sortField, sortOrder]}
                        selectionMode='single'
                        variant='faded'
                        onSelectionChange={(keys) =>
                            handleSelectionChange(Array.from(keys)[0] as SortField | SortOrder)
                        }
                    >
                        <DropdownSection showDivider title='Sort By'>
                            {(['name', 'type', 'size', 'lastModifiedDateTime'] as SortField[]).map(
                                (field) => (
                                    <DropdownItem
                                        key={field}
                                        startContent={getSortByIcon(field)}
                                        onPress={() => handleSelectionChange(field)}
                                    >
                                        {field === 'lastModifiedDateTime'
                                            ? 'Date'
                                            : field.charAt(0).toUpperCase() + field.slice(1)}
                                    </DropdownItem>
                                )
                            )}
                        </DropdownSection>
                        <DropdownSection title='Order'>
                            {(['asc', 'desc'] as SortOrder[]).map((order) => (
                                <DropdownItem
                                    key={order}
                                    startContent={
                                        order === 'asc' ? <ArrowSortDown /> : <ArrowSortUp />
                                    }
                                    onPress={() => handleSelectionChange(order)}
                                >
                                    {order === 'asc' ? 'Ascending' : 'Descending'}
                                </DropdownItem>
                            ))}
                        </DropdownSection>
                    </DropdownMenu>
                </Dropdown>
            ) : (
                <Drawer open={isOpen} onOpenChange={setOpen}>
                    <DrawerTrigger asChild>
                        <Button
                            isIconOnly
                            className='h-8 w-8 min-w-0 p-0'
                            radius='full'
                            size='sm'
                            startContent={<ListFilter size={20} />}
                            variant='light'
                            onPress={() => setOpen(true)}
                        />
                    </DrawerTrigger>
                    <DrawerContent className=''>
                        <DrawerHeader>
                            <DrawerTitle>Sort Options</DrawerTitle>
                            <DrawerDescription>Select sorting preferences below.</DrawerDescription>
                        </DrawerHeader>
                        <Listbox
                            className='mb-2'
                            selectedKeys={[sortField, sortOrder]}
                            selectionMode='single'
                            variant='faded'
                            onSelectionChange={(keys) =>
                                handleSelectionChange(Array.from(keys)[0] as SortField | SortOrder)
                            }
                        >
                            <ListboxSection showDivider title='Sort By'>
                                {(
                                    ['name', 'type', 'size', 'lastModifiedDateTime'] as SortField[]
                                ).map((field) => (
                                    <ListboxItem
                                        key={field}
                                        startContent={getSortByIcon(field)}
                                        onPress={() => handleSelectionChange(field)}
                                    >
                                        {field === 'lastModifiedDateTime'
                                            ? 'Date'
                                            : field.charAt(0).toUpperCase() + field.slice(1)}
                                    </ListboxItem>
                                ))}
                            </ListboxSection>
                            <ListboxSection title='Order'>
                                {(['asc', 'desc'] as SortOrder[]).map((order) => (
                                    <ListboxItem
                                        key={order}
                                        startContent={
                                            order === 'asc' ? <ArrowSortDown /> : <ArrowSortUp />
                                        }
                                        onPress={() => handleSelectionChange(order)}
                                    >
                                        {order === 'asc' ? 'Ascending' : 'Descending'}
                                    </ListboxItem>
                                ))}
                            </ListboxSection>
                        </Listbox>
                    </DrawerContent>
                </Drawer>
            )}
        </>
    )
}
