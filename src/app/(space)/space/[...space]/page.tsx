import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { Navbar } from '@/app/(space)/ui/navbar'
import { SortField, SortOrder } from '@/types/drive'
import { GridSkeleton, ListSkeleton } from '@/ui/skeleton'
import { siteConfig } from '@/config/site'
import { getChildren, getReadme } from '@/actions/drive'
import { userSession } from '@/actions/user'
import { Readme } from '@/app/(space)/ui/preview'
import { formatTitle } from '@/app/(space)/utils'

import { Data } from './data'

type PageProps = {
    params: Promise<{ space?: string[] }>
    searchParams: Promise<{
        s?: string
        sort?: string
        order?: 'asc' | 'desc'
        layout?: 'grid' | 'list'
    }>
}

export default async function Page({ params, searchParams }: PageProps) {
    const resolvedParams = await params
    const resolvedSearchParams = await searchParams

    const spaceArr = resolvedParams.space ?? []
    const { s = '', sort, order, layout: layoutParam } = resolvedSearchParams

    const space = spaceArr.join('/')
    const query = s

    const validSortFields: SortField[] = ['name', 'type', 'size', 'lastModifiedDateTime']
    const isValidSort = (field: string): field is SortField =>
        validSortFields.includes(field as SortField)

    const sortField = isValidSort(sort ?? '') ? (sort as SortField) : undefined

    const sortOrder = sortField && order === 'desc' ? 'desc' : sortField ? 'asc' : undefined

    const cookieStore = await cookies()
    let layout: 'grid' | 'list'

    if (layoutParam === 'list' || layoutParam === 'grid') {
        layout = layoutParam
    } else if (cookieStore.get('layout')?.value === 'list') {
        layout = 'list'
    } else {
        layout = 'grid'
    }

    return (
        <main className='flex flex-col gap-2 p-2 md:px-4 2xl:px-[10%]'>
            <Navbar
                initialQuery={query}
                initialSortField={sortField}
                initialSortOrder={sortOrder}
                title={space}
            />

            <Suspense
                fallback={
                    layout === 'list' ? (
                        <div className='flex flex-col gap-2'>
                            <ListSkeleton />
                        </div>
                    ) : (
                        <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2'>
                            <GridSkeleton />
                        </div>
                    )
                }
            >
                <Space
                    layout={layout}
                    query={query}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    space={space}
                />
            </Suspense>
        </main>
    )
}

interface Props {
    space: string
    query: string
    sortField?: SortField
    sortOrder?: SortOrder
    layout: 'grid' | 'list'
}

async function Space({ space, ...props }: Props) {
    try {
        const initial = await getChildren(`/${space}`, undefined, 50)
        const raw = await getReadme(`/${space}`)

        const { user } = await userSession()

        return (
            <>
                <Data
                    initial={{ ...initial, nextPage: initial['@odata.nextLink'] }}
                    space={space}
                    userRole={user?.role}
                    {...props}
                />
                <Readme className='rounded-lg border p-2 2xl:px-8' raw={raw || ''} />
            </>
        )
    } catch (error) {
        if (error instanceof Error && error.message.includes('could not be found')) {
            notFound()
        }
        throw error
    }
}

export async function generateMetadata({ params }: { params: Promise<{ space?: string[] }> }) {
    const resolvedParams = await params
    const space = resolvedParams.space ?? []
    const drivePath = space.join('/')
    const title = formatTitle(space.at(-1)) || 'Page Not Found'

    return {
        title: title,
        description: title,
        keywords: title,
        authors: [
            {
                name: 'Rock Star 💕',
                url: 'https://rockstar.bio',
            },
        ],
        publisher: 'Rock Star 💕',
        openGraph: {
            title: title,
            url: `${siteConfig.domain}/${drivePath}`,
            type: 'website',
            images: `/space/og?slug=/${drivePath}`,
            siteName: siteConfig.title,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description: `Explore ${title} on ${siteConfig.title}`,
            images: `/space/og?slug=/${drivePath}`,
        },
    }
}
