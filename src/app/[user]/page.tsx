import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'

import { getTabs } from '@/actions/supabase'
import { getUser } from '@/actions/user'
import { getProducts } from '@/actions/user/products'
import { userAvatar } from '@/lib/utils'

import { Profile, Tabs } from './ui'

type Props = {
    params: Promise<{ user: string }>
    searchParams: Promise<{ tab?: string }>
}

export default async function Users({ params }: Props) {
    const rawUsername = (await params).user as string
    const username = decodeURIComponent(rawUsername.split('/')[0] || '')

    if (!username.startsWith('@')) {
        redirect(`/@${username}`)
    }

    const cleanUsername = username.slice(1)

    if (!cleanUsername) return notFound()

    const user = await getUser(cleanUsername)

    if (!user) return notFound()

    // Fetch tabs for the user's role
    const tabs = await getTabs(user.role || 0)
    const { products, canManage } = await getProducts(cleanUsername)

    return (
        <div>
            <Profile canManage={canManage} user={user} />
            <div className='mx-auto -mt-14 md:mt-0 2xl:px-[10%]'>
                <Tabs canManage={canManage} products={products} tabs={tabs} user={user} />
            </div>
        </div>
    )
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { user: rawUsername } = await params
    const { tab } = await searchParams
    const username = rawUsername.split('/')[0]
    const decoded = username ? decodeURIComponent(username) : ''
    const cleanUsername = decoded.startsWith('@') ? decoded.slice(1) : decoded

    const user = await getUser(cleanUsername)

    if (!user) {
        return {
            title: 'User Not Found',
            description: 'The requested user profile could not be found.',
        }
    }

    const tabs = await getTabs(user.role || 0)
    const currentTab = tabs.find((t) => t.title.toLowerCase() === tab?.toLowerCase())

    const title = currentTab ? `${currentTab.title} - ${user.name}` : user.name

    const description = currentTab?.description
        ? currentTab.description.replace('the user', user.name).replace('this user', user.name)
        : user.bio

    const metadata: Metadata = {
        title: currentTab ? { absolute: title } : title,
        description: description,

        openGraph: {
            title: title,
            description: description || '',
            images: user.avatar ? [user.avatar as string] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description || '',
            images: user.avatar ? [user.avatar as string] : undefined,
        },
        creator: `@${user.username}`,
    }

    // Add PWA manifest for shopkeepers and admins (role 2 & 3)
    if (user.role === 2 || user.role === 3) {
        metadata.manifest = `/manifest/${user.username}`
        metadata.appleWebApp = {
            capable: true,
            statusBarStyle: 'black-translucent',
            title: user.name,
            startupImage: userAvatar(user),
        }
    }

    return metadata
}
