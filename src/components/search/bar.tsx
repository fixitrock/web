'use client'
import { Button, Image, Input } from '@heroui/react'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

import { useSearch } from '®/hooks/useSearch'
import AnimatedSearch, { useOpen } from '®/ui/farmer/search'

import { Profile } from '../user/profile'

import { DriveItem } from './drive-item'
import ShortcutKey from './shortcutkey'
import { Suggestion } from './suggestion'

const SearchBar = () => {
    const [query, setQuery] = useState('')
    const { data, isLoading } = useSearch(query)
    const { open, setOpen } = useOpen()

    return (
        <AnimatedSearch open={open} setOpen={setOpen}>
            <div
                className={`${open ? 'flex h-full max-h-[70vh] flex-col rounded-xl bg-background sm:h-[60dvh] sm:border' : ''} overflow-hidden`}
            >
                <Input
                    classNames={{
                        inputWrapper: `h-11 min-h-10 overflow-hidden bg-background/80 shadow-none backdrop-blur data-[hover=true]:bg-background/80 group-data-[focus=true]:bg-background/80 ${
                            open
                                ? 'rounded-none border-b p-2 !px-2.5'
                                : 'overflow-hidden rounded-xl border'
                        }`,
                        mainWrapper: 'overflow-hidden',
                    }}
                    endContent={
                        query ? (
                            <Button
                                isIconOnly
                                className='data-[hover]:bg-foreground/10'
                                radius='full'
                                size='sm'
                                variant='light'
                                onPress={() => setQuery('')}
                            >
                                <X size={18} />
                            </Button>
                        ) : (
                            <Profile />
                        )
                    }
                    placeholder='What do you need?'
                    size='lg'
                    startContent={<Search size={20} />}
                    type='text'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                />

                {open && (
                    <div className='flex-1 overflow-y-auto'>
                        {!query && <Suggestion setOpen={setOpen} />}
                        {query && (
                            <DriveItem
                                data={data}
                                isLoading={isLoading}
                                query={query}
                                setOpen={setOpen}
                            />
                        )}
                    </div>
                )}

                {open && (
                    <div className='sticky bottom-0 hidden select-none items-center justify-between border-t p-1.5 lg:flex'>
                        <Image alt='Fix iT Rock' height={30} src='/icons/rdrive.png' width={30} />
                        <ShortcutKey />
                    </div>
                )}
            </div>
        </AnimatedSearch>
    )
}

export default SearchBar
