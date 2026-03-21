import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { ComponentType } from 'react'

import { userProfile } from '@/actions/user'
import { userAvatar } from '@/lib/utils'
import { checkAuth } from '@/actions/auth'

import Profile from './ui/profile'
import Tabs from './ui/tabs'
import { loadServerTabComponent, TabComponentName } from './ui/tabs/loadTab'

export type UserTab = {
    title: string
    description?: string
    component: TabComponentName
}

type Props = {
    params: Promise<{ user: string }>
    searchParams: Promise<{
        tab?: string
        page?: string
        search?: string
        category?: string
    }>
}

export default async function Users({ params, searchParams }: Props) {
    const rawUsername = (await params).user
    const username = decodeURIComponent(rawUsername.split('/')[0] || '')

    if (!username.startsWith('@')) redirect(`/@${username}`)

    const cleanUsername = username.slice(1)
    if (!cleanUsername) return notFound()
    const profile = await userProfile(cleanUsername)
    if (!profile) return notFound()

    const user = profile.user
    const tabs = (profile.tabs || []) as UserTab[]
    const defaultTab = tabs[0]

    if (!defaultTab) return notFound()

    const { can } = await checkAuth(cleanUsername)

    const resolvedSearchParams = await searchParams
    const requestedTab = resolvedSearchParams.tab?.toLowerCase() || 'activity'
    const activeTab = tabs.find((t) => t.title.toLowerCase() === requestedTab) || defaultTab

    const Content = await loadServerTabComponent(activeTab.component)
    const RenderTab = Content as ComponentType<any>
    const initialProductsParams = {
        category: resolvedSearchParams.category || '',
        page: resolvedSearchParams.page || '',
        search: resolvedSearchParams.search || '',
    }

    return (
        <div>
            <Profile user={user} can={can} />

            <div className='relative mx-auto 2xl:px-[10%]'>
                <Tabs tabs={tabs} user={user} />
                <RenderTab user={user} can={can} initialProductsParams={initialProductsParams} />
            </div>
        </div>
    )
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const raw = (await params).user
    const resolvedSearchParams = await searchParams
    const tab = resolvedSearchParams.tab
    const productCategory = resolvedSearchParams.category || ''
    const searchQuery = (resolvedSearchParams.search || '').trim()
    const pageParam = Number(resolvedSearchParams.page || 1)
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1

    const username = decodeURIComponent(raw.split('/')[0] || '')
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username

    const profile = await userProfile(cleanUsername)
    if (!profile) {
        return {
            title: 'User Not Found',
            description: 'The requested user profile could not be found.',
        }
    }

    const user = profile.user
    const tabs = (profile.tabs || []) as UserTab[]

    const currentTab = tabs.find((t) => t.title.toLowerCase() === tab?.toLowerCase())

    let title = currentTab ? `${currentTab.title} - ${user.name}` : user.name
    let description =
        currentTab?.description?.replace('the user', user.name).replace('this user', user.name) ||
        user.bio ||
        ''

    if (currentTab?.title.toLowerCase() === 'products') {
        const heading =
            productCategory ||
            (searchQuery ? searchQuery : page > 1 ? `Products Page ${page}` : 'Products')
        title = `${heading} - ${user.name}`

        const descParts = [`Browse ${user.name}'s products`]
        if (productCategory) descParts.push(`category: ${productCategory}`)
        if (searchQuery) descParts.push(`search: "${searchQuery}"`)
        if (page > 1) descParts.push(`page ${page}`)
        description = `${descParts.join(' • ')}.`
    }

    const canonicalParams = new URLSearchParams()
    if (tab) canonicalParams.set('tab', tab)
    if (productCategory && currentTab?.title.toLowerCase() === 'products') {
        canonicalParams.set('category', productCategory)
    }
    if (searchQuery && currentTab?.title.toLowerCase() === 'products') {
        canonicalParams.set('search', searchQuery)
    }
    if (page > 1 && currentTab?.title.toLowerCase() === 'products') {
        canonicalParams.set('page', String(page))
    }
    const canonical = canonicalParams.toString()
        ? `/@${user.username}?${canonicalParams.toString()}`
        : `/@${user.username}`

    const metadata: Metadata = {
        title: { absolute: title },
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            images: user.avatar ? [user.avatar] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: user.avatar ? [user.avatar] : undefined,
        },
        creator: `@${user.username}`,
    }

    if (user.role === 2 || user.role === 3) {
        metadata.manifest = `/manifest/${user.username}`
        metadata.icons = {
            icon: '/favicon.ico',
            shortcut: '/favicon.ico',
            apple: [
                {
                    url: userAvatar(user, 120),
                    sizes: '120x120',
                    type: 'image/png',
                },
                {
                    url: userAvatar(user, 180),
                    sizes: '180x180',
                    type: 'image/png',
                },
                {
                    url: userAvatar(user, 152),
                    sizes: '152x152',
                    type: 'image/png',
                },
                {
                    url: userAvatar(user, 167),
                    sizes: '167x167',
                    type: 'image/png',
                },
            ],
        }
        metadata.appleWebApp = {
            capable: true,
            statusBarStyle: 'default',
            title: user.name,
            startupImage: [
                {
                    url: userAvatar(user),
                    media: '(prefers-color-scheme: light)',
                },
                {
                    url: userAvatar(user),
                    media: '(prefers-color-scheme: dark)',
                },
            ],
        }
    }

    return metadata
}
