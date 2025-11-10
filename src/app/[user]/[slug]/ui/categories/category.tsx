'use client'
import AddEdit from './add'
import { Button, Navbar, Image, useDisclosure, Skeleton } from '@heroui/react'

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/ui/command'
import { Edit, FolderOpen, Plus, SearchIcon, X } from 'lucide-react'

import { useCategories } from '@/hooks/tanstack/query'
import { bucketUrl } from '@/supabase/bucket'
import { fallback } from '@/config/site'
// import { Delete } from '@/ui/icons'
import { cn } from '@/lib/utils'
import { useCategoryStore } from '@/zustand/store'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { HiViewGridAdd } from 'react-icons/hi'
import { CanType } from '@/actions/auth'

export function Category({ can }: { can: CanType }) {
    const { data, isLoading, error } = useCategories()
    const [query, setQuery] = useState('')
    const addModal = useDisclosure({ defaultOpen: false })
    const editModal = useDisclosure({ defaultOpen: false })
    const { setMode } = useCategoryStore()
    useEffect(() => {
        if (error) {
            toast.error(error.message)
        }
    }, [error])
    const openEditModal = (category: any) => {
        setMode('edit', category)
        editModal.onOpen()
    }
    return (
        <Command className='gap-1.5 p-2 2xl:px-[10%]' loop>
            <Navbar
                shouldHideOnScroll
                classNames={{
                    wrapper: 'h-auto w-full p-0 py-2',
                }}
                maxWidth='full'
            >
                <div className='hidden items-center gap-1 md:flex md:w-[50%] lg:w-[70%]'>
                    <HiViewGridAdd className='size-8' />
                    <h1 className='text-xl font-bold'>Categories</h1>
                </div>
                <div
                    className={`${can.create.category ? 'lg:w-[30%]' : 'lg:w-[20%]'} flex w-full items-center gap-4 md:w-[50%]`}
                >
                    <CommandInput
                        placeholder='Search Categories . . . '
                        className='h-8 w-full rounded-md border'
                        endContent={
                            <>
                                {query && (
                                    <Button
                                        isIconOnly
                                        className='bg-default/20 h-6.5 w-6.5 min-w-auto border-1 p-0'
                                        radius='full'
                                        size='sm'
                                        startContent={<X size={18} />}
                                        variant='light'
                                        onPress={() => setQuery('')}
                                    />
                                )}
                                {can.create.category && (
                                    <Button
                                        isIconOnly
                                        className='border-1.5 bg-default/20 h-6.5 w-6.5 min-w-auto border-dashed p-0 md:hidden'
                                        radius='full'
                                        size='sm'
                                        startContent={<Plus size={20} />}
                                        variant='light'
                                        onPress={addModal.onOpen}
                                    />
                                )}
                            </>
                        }
                        startContent={<SearchIcon className='size-5 shrink-0' />}
                        value={query}
                        onValueChange={(value) => setQuery(value)}
                    />
                    {can.create.category && (
                        <Button
                            className='bg-default/20 hidden min-w-fit rounded-md border border-dashed md:flex'
                            variant='light'
                            onPress={addModal.onOpen}
                            size='sm'
                        >
                            <Plus size={18} /> Create Category
                        </Button>
                    )}
                </div>
            </Navbar>
            <CommandList
                asChild
                className='grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:px-4'
            >
                {isLoading && <CategorySkeleton />}
                {data?.categories.map((c) => {
                    return (
                        <CommandItem
                            data-slot={c.id}
                            key={c.id}
                            value={c.name}
                            keywords={c.keywords}
                            className='group data relative flex aspect-square flex-col gap-2 rounded-xl border p-1.5'
                            tabIndex={0}
                        >
                            <Image
                                removeWrapper
                                alt={c.name}
                                className='bg-default/10 aspect-square size-full object-cover select-none'
                                loading='lazy'
                                radius='sm'
                                src={`${bucketUrl(c.image)}?v=${c.updated_at}` || fallback.category}
                            />
                            <h3 className='font-mono'>{c.name}</h3>
                            {can.update.category && (
                                <div
                                    className={cn(
                                        'absolute top-1.5 right-1.5 z-10 flex gap-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 data-[selected=true]:bg-red-500'
                                    )}
                                >
                                    <Button
                                        isIconOnly
                                        className='bg-background border'
                                        radius='full'
                                        size='sm'
                                        startContent={<Edit size={18} />}
                                        variant='light'
                                        onPress={() => openEditModal(c)}
                                    />
                                </div>
                            )}
                        </CommandItem>
                    )
                })}
            </CommandList>
            {!isLoading && query && (
                <CommandEmpty className='flex flex-col items-center justify-center gap-6 p-4 py-16 text-center'>
                    <Image
                        removeWrapper
                        className='aspect-square size-40 object-cover select-none'
                        loading='lazy'
                        radius='sm'
                        src={fallback.categorySearch}
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
            )}

            {data?.empty && !query && (
                <CommandEmpty className='text-muted-foreground m-auto flex h-full w-full flex-1 flex-col items-center justify-center gap-2 p-4 py-10 text-center'>
                    <FolderOpen className='text-muted-foreground/80 h-12 w-12' />
                    <h3 className='text-foreground text-base font-semibold'>No Categories Yet</h3>
                    <p className='text-muted-foreground/70 max-w-sm text-sm'>
                        It looks a bit empty here. Start by adding your first category to organize
                        your products.
                    </p>
                    {can.create.category && (
                        <Button
                            className='bg-default/20 hidden min-w-fit rounded-md border border-dashed md:flex'
                            variant='light'
                            onPress={addModal.onOpen}
                            size='sm'
                        >
                            <Plus size={18} /> Add Category
                        </Button>
                    )}
                </CommandEmpty>
            )}
            <AddEdit isOpen={addModal.isOpen} onClose={addModal.onClose} type='add' />
            <AddEdit isOpen={editModal.isOpen} onClose={editModal.onClose} type='edit' />
        </Command>
    )
}

function CategorySkeleton({ count = 18 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
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
