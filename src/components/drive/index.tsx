'use client'

import { usePathname } from 'next/navigation'

import { useDrive } from '®/hooks/useDrive'
import Breadcrumb from '®/ui/breadcrumb'
import useLayout from '®/hooks/useLayout'
import { FolderEmpty, SearchEmpty, NotFound } from '®/ui/state'

import Input from './input'
import { Preview } from './preview'
import { SortBy } from './sort'
import Layout from './layout'
import { Grid } from './grid'
import { List } from './list'

export function Drive({ drive }: { drive: string }) {
    const {
        data,
        isLoading,
        query,
        setQuery,
        sort,
        selectedItem,
        open,
        setOpen,
        selectItem,
        ref,
        loadMore,
        focus,
        status,
    } = useDrive(drive)
    const { layout, hydrated } = useLayout()
    const path = usePathname()
    const title = path.split('/').pop()

    return (
        <div className='flex flex-col gap-4'>
            <Breadcrumb />
            <div className='flex space-x-1.5'>
                <Input
                    hotKey='/'
                    placeholder={
                        status === 'notFound' ? 'Oops, Page Not Found!' : `Search in ${title}`
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <SortBy sort={sort} />
                <Layout />
            </div>
            {hydrated ? (
                status === 'notFound' ? (
                    <NotFound />
                ) : query && data?.value?.length === 0 ? (
                    <SearchEmpty query={query} />
                ) : status === 'empty' ? (
                    <FolderEmpty />
                ) : layout === 'Grid' ? (
                    <Grid
                        data={data}
                        focus={focus}
                        isLoading={isLoading}
                        loadMore={loadMore}
                        onSelect={selectItem}
                    />
                ) : (
                    <List
                        data={data}
                        focus={focus}
                        isLoading={isLoading}
                        loadMore={loadMore}
                        onSelect={selectItem}
                    />
                )
            ) : null}

            <div ref={ref} />
            {selectedItem && <Preview data={selectedItem} open={open} setOpen={setOpen} />}
        </div>
    )
}
