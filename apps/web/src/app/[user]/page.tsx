import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

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
    searchParams: Promise<{ tab?: string }>
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

    const { can } = await checkAuth(cleanUsername)

    const requestedTab = (await searchParams).tab?.toLowerCase() || 'activity'
    const activeTab = tabs.find((t) => t.title.toLowerCase() === requestedTab) || tabs[0]

    const Content = await loadServerTabComponent(activeTab.component)

    return (
        <div>
            <Profile user={user} can={can} />

            <div className='relative mx-auto 2xl:px-[10%]'>
                <Tabs tabs={tabs} user={user} />
                <div className='m-2'>
                    <Content user={user} can={can} />
                </div>
            </div>
        </div>
    )
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const raw = (await params).user
    const tab = (await searchParams).tab

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

    const title = currentTab ? `${currentTab.title} - ${user.name}` : user.name

    const description =
        currentTab?.description?.replace('the user', user.name).replace('this user', user.name) ||
        user.bio ||
        ''

    const metadata: Metadata = {
        title: { absolute: title },
        description,
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
