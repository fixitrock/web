'use client'

import * as React from 'react'
import { Button, Input } from '@heroui/react'
import { Check, ListFilter, Search, Sparkles, X } from 'lucide-react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Checkbox } from '@/ui/checkbox'
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'

type FilterOption = {
    id: string
    label: string
}

const categoryOptions: FilterOption[] = [
    { id: 'all', label: 'All Products' },
    { id: 'streetwear', label: 'Streetwear' },
    { id: 'sneakers', label: 'Sneakers' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'home', label: 'Home Goods' },
    { id: 'beauty', label: 'Beauty' },
    { id: 'tech', label: 'Tech' },
    { id: 'kids', label: 'Kids' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'gifts', label: 'Gifts' },
    { id: 'office', label: 'Office' },
    { id: 'jewelry', label: 'Jewelry' },
    { id: 'stationery', label: 'Stationery' },
    { id: 'seasonal', label: 'Seasonal' },
    { id: 'pet', label: 'Pet Supplies' },
    { id: 'travel', label: 'Travel' },
    { id: 'camping', label: 'Camping' },
    { id: 'kitchen', label: 'Kitchen' },
    { id: 'audio', label: 'Audio' },
]

const brandOptions: FilterOption[] = [
    { id: 'northwind', label: 'Northwind' },
    { id: 'atlas', label: 'Atlas Supply' },
    { id: 'lumen', label: 'Lumen Studio' },
    { id: 'everlane', label: 'Everlane' },
    { id: 'dune', label: 'Dune & Co' },
    { id: 'kindle', label: 'Kindleware' },
    { id: 'river', label: 'River & Pine' },
    { id: 'vertex', label: 'Vertex' },
    { id: 'axis', label: 'Axis' },
    { id: 'nova', label: 'Nova Labs' },
    { id: 'mosaic', label: 'Mosaic' },
    { id: 'eden', label: 'Eden Goods' },
    { id: 'harbor', label: 'Harborline' },
    { id: 'apex', label: 'Apex' },
    { id: 'canvas', label: 'Canvas Market' },
    { id: 'forge', label: 'Forge & Field' },
    { id: 'sol', label: 'Sol & Stone' },
    { id: 'copper', label: 'Copper Craft' },
    { id: 'juniper', label: 'Juniper' },
    { id: 'coast', label: 'Coastline' },
]

function toggleSet(setValue: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) {
    setValue((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }
        return next
    })
}

function toggleCategory(setValue: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) {
    setValue((prev) => {
        const next = new Set(prev)
        if (id === 'all') {
            if (next.has('all') && next.size === 1) {
                next.clear()
            } else {
                next.clear()
                next.add('all')
            }
            return next
        }

        if (next.has(id)) {
            next.delete(id)
        } else {
            next.add(id)
        }
        next.delete('all')
        return next
    })
}

function setVisibleInSet(
    setValue: React.Dispatch<React.SetStateAction<Set<string>>>,
    ids: string[],
    shouldSelect: boolean
) {
    setValue((prev) => {
        const next = new Set(prev)
        for (const id of ids) {
            if (shouldSelect) {
                next.add(id)
            } else {
                next.delete(id)
            }
        }
        return next
    })
}

function setVisibleInCategories(
    setValue: React.Dispatch<React.SetStateAction<Set<string>>>,
    ids: string[],
    shouldSelect: boolean
) {
    setValue((prev) => {
        const next = new Set(prev)

        if (shouldSelect) {
            if (ids.includes('all')) {
                next.clear()
                next.add('all')
                return next
            }
            next.delete('all')
            for (const id of ids) {
                next.add(id)
            }
            return next
        }

        for (const id of ids) {
            next.delete(id)
        }
        return next
    })
}

function FilterSection({
    title,
    options,
    selected,
    searchValue,
    globalSearchValue,
    onSearch,
    onToggle,
    onSetVisible,
    onClear,
}: {
    title: string
    options: FilterOption[]
    selected: Set<string>
    searchValue: string
    globalSearchValue: string
    onSearch: (value: string) => void
    onToggle: (id: string) => void
    onSetVisible: (ids: string[], shouldSelect: boolean) => void
    onClear: () => void
}) {
    const defaultVisibleCount = 8
    const [expanded, setExpanded] = React.useState(false)

    const filteredOptions = React.useMemo(() => {
        const query = `${globalSearchValue} ${searchValue}`.trim().toLowerCase()
        if (!query) {
            return options
        }
        return options.filter((option) => option.label.toLowerCase().includes(query))
    }, [globalSearchValue, options, searchValue])

    const hasSearch = !!searchValue.trim() || !!globalSearchValue.trim()
    const shouldCollapse = !hasSearch && !expanded
    const visibleOptions = shouldCollapse
        ? filteredOptions.slice(0, defaultVisibleCount)
        : filteredOptions
    const hiddenCount = filteredOptions.length - visibleOptions.length
    const canToggle = !hasSearch && filteredOptions.length > defaultVisibleCount
    const allVisibleSelected =
        visibleOptions.length > 0 && visibleOptions.every((option) => selected.has(option.id))

    return (
        <section className='border-default-200 from-background to-default-100/30 space-y-3 rounded-xl border bg-linear-to-br p-3'>
            <div className='flex items-center justify-between'>
                <p className='text-foreground/80 text-xs font-semibold tracking-wide uppercase'>
                    {title}
                </p>
                <span className='text-muted-foreground text-[11px]'>{selected.size} selected</span>
            </div>

            <Input
                classNames={{
                    inputWrapper:
                        'border-default-200 bg-background/80 data-[hover=true]:bg-background h-8 rounded-md border shadow-none',
                    input: 'text-xs',
                }}
                placeholder={`Search ${title.toLowerCase()}...`}
                size='sm'
                startContent={<Search className='text-muted-foreground h-3.5 w-3.5' />}
                value={searchValue}
                onValueChange={onSearch}
            />

            <div className='flex flex-wrap gap-2'>
                <Button
                    className='h-7 px-2 text-xs'
                    radius='full'
                    size='sm'
                    variant='flat'
                    onPress={() =>
                        onSetVisible(
                            visibleOptions.map((option) => option.id),
                            !allVisibleSelected
                        )
                    }
                >
                    {allVisibleSelected ? 'Deselect visible' : 'Select visible'}
                </Button>
                <Button
                    className='h-7 px-2 text-xs'
                    radius='full'
                    size='sm'
                    variant='light'
                    onPress={onClear}
                >
                    Clear {title.toLowerCase()}
                </Button>
            </div>

            <div className='border-default-300/80 bg-background/70 max-h-56 overflow-y-auto rounded-lg border border-dashed p-2'>
                <div className='grid grid-cols-1 gap-1.5 sm:grid-cols-2'>
                    {visibleOptions.map((option) => {
                        const isSelected = selected.has(option.id)
                        return (
                            <label
                                key={option.id}
                                className={`flex cursor-pointer items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-xs transition ${
                                    isSelected
                                        ? 'border-primary/50 bg-primary/10'
                                        : 'hover:border-default-300 hover:bg-default/40 border-transparent'
                                }`}
                            >
                                <span className='flex min-w-0 items-center gap-2'>
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => onToggle(option.id)}
                                    />
                                    <span className='text-foreground/90 truncate'>
                                        {option.label}
                                    </span>
                                </span>
                                {isSelected && (
                                    <Check className='text-primary h-3.5 w-3.5 shrink-0' />
                                )}
                            </label>
                        )
                    })}
                </div>
                {!filteredOptions.length && (
                    <div className='text-muted-foreground px-2 py-4 text-center text-xs'>
                        No matches found.
                    </div>
                )}
            </div>

            {canToggle && (
                <Button
                    className='h-7 px-2 text-xs'
                    radius='full'
                    size='sm'
                    variant='light'
                    onPress={() => setExpanded((prev) => !prev)}
                >
                    {expanded ? 'Show less' : `Show ${hiddenCount} more`}
                </Button>
            )}
        </section>
    )
}

function FilterFooter({
    selectedCount,
    onApply,
    onClear,
}: {
    selectedCount: number
    onApply: () => void
    onClear: () => void
}) {
    return (
        <div className='flex items-center gap-2 p-4'>
            <Button className='flex-1' radius='full' size='sm' onPress={onApply}>
                Apply Filters
            </Button>
            <Button className='flex-1' radius='full' size='sm' variant='bordered' onPress={onClear}>
                Reset ({selectedCount})
            </Button>
        </div>
    )
}

type SelectedTag = {
    id: string
    label: string
    group: 'category' | 'brand'
}

function SelectedPills({
    selected,
    onRemove,
}: {
    selected: SelectedTag[]
    onRemove: (tag: SelectedTag) => void
}) {
    if (!selected.length) {
        return (
            <p className='text-muted-foreground text-[11px]'>
                No filters selected yet. Start with a category or brand.
            </p>
        )
    }

    return (
        <div className='flex flex-wrap gap-1.5'>
            {selected.map((tag) => (
                <button
                    key={`${tag.group}-${tag.id}`}
                    className='bg-default/50 hover:bg-default/70 border-default-300 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] transition'
                    type='button'
                    onClick={() => onRemove(tag)}
                >
                    <span>{tag.label}</span>
                    <X className='h-3 w-3' />
                </button>
            ))}
        </div>
    )
}

export function ProductFilter() {
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [open, setOpen] = React.useState(false)
    const [selectedCategories, setSelectedCategories] = React.useState(new Set<string>())
    const [selectedBrands, setSelectedBrands] = React.useState(new Set<string>())
    const [categorySearch, setCategorySearch] = React.useState('')
    const [brandSearch, setBrandSearch] = React.useState('')
    const [globalSearch, setGlobalSearch] = React.useState('')

    const selectedCount = selectedCategories.size + selectedBrands.size

    const categoryLookup = React.useMemo(
        () => new Map(categoryOptions.map((option) => [option.id, option.label])),
        []
    )
    const brandLookup = React.useMemo(
        () => new Map(brandOptions.map((option) => [option.id, option.label])),
        []
    )

    const selectedTags = React.useMemo(() => {
        const tags: SelectedTag[] = []
        for (const id of selectedCategories) {
            const label = categoryLookup.get(id)
            if (label) {
                tags.push({ id, label, group: 'category' })
            }
        }
        for (const id of selectedBrands) {
            const label = brandLookup.get(id)
            if (label) {
                tags.push({ id, label, group: 'brand' })
            }
        }
        return tags
    }, [brandLookup, categoryLookup, selectedBrands, selectedCategories])

    const handleClear = () => {
        setSelectedCategories(new Set())
        setSelectedBrands(new Set())
        setCategorySearch('')
        setBrandSearch('')
        setGlobalSearch('')
    }

    const handleApply = () => {
        setOpen(false)
    }

    const handleRemoveTag = (tag: SelectedTag) => {
        if (tag.group === 'category') {
            toggleCategory(setSelectedCategories, tag.id)
            return
        }
        toggleSet(setSelectedBrands, tag.id)
    }

    const trigger = (
        <Button
            isIconOnly
            aria-label='Product filters'
            className='border-default-200 from-background via-default-50 to-default-100/70 relative h-9 w-9 min-w-0 border bg-linear-to-br p-0 shadow-sm'
            radius='full'
            size='sm'
            startContent={<ListFilter size={18} />}
            bg-linear-to-br
            variant='light'
            onPress={() => setOpen(true)}
        >
            {selectedCount > 0 && (
                <span className='bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold'>
                    {selectedCount}
                </span>
            )}
        </Button>
    )

    const panel = (
        <>
            <div className='from-default-100/60 border-b bg-linear-to-r to-transparent p-4'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='space-y-1'>
                        <p className='flex items-center gap-1.5 text-sm font-semibold'>
                            <Sparkles className='text-primary h-4 w-4' />
                            Smart Filters
                        </p>
                        <p className='text-muted-foreground text-xs'>
                            Pick categories and brands in seconds.
                        </p>
                    </div>
                    <Button
                        className='h-7 px-2 text-xs'
                        radius='full'
                        size='sm'
                        variant='light'
                        onPress={handleClear}
                    >
                        Clear all
                    </Button>
                </div>

                <Input
                    className='mt-3'
                    classNames={{
                        inputWrapper:
                            'border-default-200 bg-background/85 data-[hover=true]:bg-background h-8 rounded-md border shadow-none',
                        input: 'text-xs',
                    }}
                    placeholder='Quick find category or brand...'
                    size='sm'
                    startContent={<Search className='text-muted-foreground h-3.5 w-3.5' />}
                    value={globalSearch}
                    onValueChange={setGlobalSearch}
                />

                <div className='mt-3'>
                    <SelectedPills selected={selectedTags} onRemove={handleRemoveTag} />
                </div>
            </div>

            <div className='max-h-[56vh] space-y-4 overflow-y-auto px-4 py-4'>
                <FilterSection
                    title='Categories'
                    options={categoryOptions}
                    selected={selectedCategories}
                    searchValue={categorySearch}
                    globalSearchValue={globalSearch}
                    onSearch={setCategorySearch}
                    onToggle={(id) => toggleCategory(setSelectedCategories, id)}
                    onSetVisible={(ids, shouldSelect) =>
                        setVisibleInCategories(setSelectedCategories, ids, shouldSelect)
                    }
                    onClear={() => setSelectedCategories(new Set())}
                />
                <FilterSection
                    title='Brands'
                    options={brandOptions}
                    selected={selectedBrands}
                    searchValue={brandSearch}
                    globalSearchValue={globalSearch}
                    onSearch={setBrandSearch}
                    onToggle={(id) => toggleSet(setSelectedBrands, id)}
                    onSetVisible={(ids, shouldSelect) =>
                        setVisibleInSet(setSelectedBrands, ids, shouldSelect)
                    }
                    onClear={() => setSelectedBrands(new Set())}
                />
            </div>
        </>
    )

    return isDesktop ? (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent align='end' className='w-[min(95vw,30rem)] p-0'>
                {panel}
                <div className='border-t'>
                    <FilterFooter
                        selectedCount={selectedCount}
                        onApply={handleApply}
                        onClear={handleClear}
                    />
                </div>
            </PopoverContent>
        </Popover>
    ) : (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{trigger}</DrawerTrigger>
            <DrawerContent className='h-[88vh]'>
                <DrawerHeader className='pb-1'>
                    <DrawerTitle>Filters</DrawerTitle>
                    <DrawerDescription>Refine products by category and brand.</DrawerDescription>
                </DrawerHeader>
                <DrawerBody className='p-0'>{panel}</DrawerBody>
                <DrawerFooter className='bg-background/95 border-t backdrop-blur'>
                    <FilterFooter
                        selectedCount={selectedCount}
                        onApply={handleApply}
                        onClear={handleClear}
                    />
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
