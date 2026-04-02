'use client'

import Image from 'next/image'
import { Button, Skeleton } from '@heroui/react'
import { Navbar } from '@heroui/navbar'
import { Edit, FolderOpen, Plus, SearchIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { HiViewGridAdd } from 'react-icons/hi'
import { toast } from 'sonner'

import { CanType } from '@/actions/auth'
import { fallback } from '@/config/site'
import { useCategories } from '@/hooks/tanstack/query'
import { cn } from '@/lib/utils'
import { bucketUrl } from '@/supabase/bucket'
import { useCategoryStore } from '@/zustand/store'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/ui/command'

import AddEdit from './add'

export function Category({ can }: { can: CanType }) {
    const { data, isLoading, error } = useCategories()
    const [query, setQuery] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const { setMode } = useCategoryStore()

    useEffect(() => {
        if (error) {
            toast.error(error.message)
        }
    }, [error])

    const openEditModal = (category: any) => {
        setMode('edit', category)
        setIsEditOpen(true)
    }

    return (
        <Command className='gap-1.5 p-2 2xl:px-[10%]' loop>
            <Navbar shouldHideOnScroll className='h-auto w-full p-0 py-2' maxWidth='full'>
                <div className='hidden items-center gap-1 md:flex md:w-[50%] lg:w-[70%]'>
                    <HiViewGridAdd className='size-8' />
                    <h1 className='text-xl font-bold'>Categories</h1>
                </div>
                <div
                    className={`${can.create.category ? 'lg:w-[30%]' : 'lg:w-[20%]'} flex w-full items-center gap-4 md:w-[50%]`}
                >
                    <CommandInput
                        className='h-8 w-full rounded-md border'
                        endContent={
                            <>
                                {query ? (
                                    <Button
                                        isIconOnly
                                        className='bg-default/20 h-6.5 w-6.5 min-w-auto rounded-full border p-0'
                                        size='sm'
                                        variant='ghost'
                                        onPress={() => setQuery('')}
                                    >
                                        <X size={18} />
                                    </Button>
                                ) : null}
                                {can.create.category ? (
                                    <Button
                                        isIconOnly
                                        className='border-1.5 bg-default/20 h-6.5 w-6.5 min-w-auto rounded-full border-dashed p-0 md:hidden'
                                        size='sm'
                                        variant='ghost'
                                        onPress={() => setIsAddOpen(true)}
                                    >
                                        <Plus size={20} />
                                    </Button>
                                ) : null}
                            </>
                        }
                        placeholder='Search Categories . . . '
                        startContent={<SearchIcon className='size-5 shrink-0' />}
                        value={query}
                        onValueChange={(value) => setQuery(value)}
                    />
                    {can.create.category ? (
                        <Button
                            className='bg-default/20 hidden min-w-fit rounded-md border border-dashed md:flex'
                            size='sm'
                            variant='ghost'
                            onPress={() => setIsAddOpen(true)}
                        >
                            <Plus size={18} />
                            Create Category
                        </Button>
                    ) : null}
                </div>
            </Navbar>
            <CommandList
                asChild
                className='grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:px-4'
            >
                {isLoading ? <CategorySkeleton /> : null}
                {data?.categories.map((category) => (
                    <CommandItem
                        key={category.id}
                        className='overflow-hidden rounded-xl border'
                        data-slot={category.id}
                        keywords={category.keywords}
                        tabIndex={0}
                        value={category.name}
                    >
                        <div className='flex w-full flex-col items-center gap-2'>
                            <div className='bg-default/10 relative aspect-square w-full overflow-hidden rounded-lg'>
                                <Image
                                    alt={category.name}
                                    className='object-cover select-none'
                                    fill
                                    sizes='(max-width: 640px) 140px, 220px'
                                    src={`${bucketUrl(category.image)}?v=${category.updated_at}` || fallback.category}
                                />
                            </div>
                            <h3 className='font-mono'>{category.name}</h3>
                            {can.update.category ? (
                                <div
                                    className={cn(
                                        'absolute top-1.5 right-1.5 z-10 flex gap-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
                                    )}
                                >
                                    <Button
                                        isIconOnly
                                        className='bg-background rounded-full border'
                                        size='sm'
                                        variant='ghost'
                                        onPress={() => openEditModal(category)}
                                    >
                                        <Edit size={18} />
                                    </Button>
                                </div>
                            ) : null}
                        </div>
                    </CommandItem>
                ))}
            </CommandList>
            {!isLoading && query ? (
                <CommandEmpty className='flex flex-col items-center justify-center gap-6 p-4 py-16 text-center'>
                    <Image
                        alt={fallback.category}
                        className='aspect-square size-40 object-cover select-none'
                        height={160}
                        src={fallback.categorySearch}
                        width={160}
                    />

                    <div className='max-w-sm space-y-2'>
                        <h3 className='text-foreground text-lg font-semibold'>Nothing found</h3>
                        <p className='text-muted-foreground text-sm leading-relaxed'>
                            We couldn't find any results matching your search. Try adjusting your
                            filters or search terms.
                        </p>
                    </div>

                    <div className='flex flex-wrap justify-center gap-2 pt-2'>
                        <div className='bg-secondary/50 text-secondary-foreground border-secondary rounded-full border px-3 py-1 text-xs'>
                            Try different keywords
                        </div>
                        <div className='bg-secondary/50 text-secondary-foreground border-secondary rounded-full border px-3 py-1 text-xs'>
                            Clear filters
                        </div>
                    </div>
                </CommandEmpty>
            ) : null}

            {data?.empty && !query ? (
                <CommandEmpty className='text-muted-foreground m-auto flex h-full w-full flex-1 flex-col items-center justify-center gap-2 p-4 py-10 text-center'>
                    <FolderOpen className='text-muted-foreground/80 h-12 w-12' />
                    <h3 className='text-foreground text-base font-semibold'>No Categories Yet</h3>
                    <p className='text-muted-foreground/70 max-w-sm text-sm'>
                        It looks a bit empty here. Start by adding your first category to organize
                        your products.
                    </p>
                    {can.create.category ? (
                        <Button
                            className='bg-default/20 hidden min-w-fit rounded-md border border-dashed md:flex'
                            size='sm'
                            variant='ghost'
                            onPress={() => setIsAddOpen(true)}
                        >
                            <Plus size={18} />
                            Add Category
                        </Button>
                    ) : null}
                </CommandEmpty>
            ) : null}
            <AddEdit isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} type='add' />
            <AddEdit isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} type='edit' />
        </Command>
    )
}

function CategorySkeleton({ count = 18 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        'relative flex aspect-square animate-pulse flex-col gap-2 rounded-xl border p-1.5'
                    )}
                >
                    <Skeleton className='aspect-square w-full rounded-sm' />
                    <Skeleton className='mx-auto h-5 w-2/3 justify-center rounded' />
                </div>
            ))}
        </>
    )
}
