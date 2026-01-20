import { redirect } from 'next/navigation'
import { Metadata } from 'next'

import { userProfile, userSession } from '@/actions/user'
import { getSlug } from '@/actions/supabase/getSlug'

import Products from './ui/products'
import { Brands, Categories, Orders, Pos, Settings, Stocks } from './ui'
import { userAvatar } from '@/lib/utils'

const components: Record<
    string,
    React.ComponentType<{
        params: { user: string }
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    }>
> = {
    Products,
    Pos,
    Orders,
    Stocks,
    Brands,
    Categories,
    Settings,
}

type Props = {
    params: Promise<{ user: string; slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SlugPage({ params, searchParams }: Props) {
    const { user, slug } = await params
    const cleanUsername = decodeURIComponent(user).replace(/^@/, '')
    const data = await userProfile(cleanUsername)
    if (!data || !data.user) return redirect('/login')

    const profile = data.user
    const session = await userSession()

    const allowedSlugs = await getSlug(profile.role || 0)
    const slugConfig = allowedSlugs.find((s) => s && s.slug === slug)

    if (!slugConfig) return redirect(`/@${cleanUsername}`)

    if (
        slugConfig.private &&
        (!session?.user ||
            session.user.username !== cleanUsername ||
            session.user.role !== profile.role)
    ) {
        return redirect(`/@${cleanUsername}`)
    }

    const Section = components[slugConfig.component] || (() => <div>Page not found</div>)

    return <Section params={{ user: cleanUsername }} searchParams={searchParams} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { user, slug } = await params

    const cleanUsername = decodeURIComponent(user).replace(/^@/, '')

    const data = await userProfile(cleanUsername)
    if (!data || !data.user) {
        return {
            title: 'User Not Found',
            description: 'The requested user profile could not be found.',
        }
    }

    const profile = data.user

    const allowedSlugs = await getSlug(profile.role || 0)
    const slugConfig = allowedSlugs.find((s) => s && s.slug === slug)

    if (!slugConfig) {
        return {
            title: 'Page Not Found',
            description: 'The requested page could not be found.',
        }
    }

    const title = `${slugConfig.title || slug} - ${profile.name}`
    const description =
        slugConfig.description
            ?.replace('the user', profile.name)
            ?.replace('this user', profile.name) ??
        `View ${slugConfig.title || slug} from ${profile.name}`

    const metadata: Metadata = {
        title: { absolute: title },
        description,
        openGraph: {
            title,
            description,
            images: [userAvatar(profile)],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [userAvatar(profile)],
        },
        creator: `@${profile.username}`,
    }

    if (profile.role === 2 || profile.role === 3) {
        metadata.manifest = `/manifest/${profile.username}`
        metadata.appleWebApp = {
            capable: true,
            statusBarStyle: 'black-translucent',
            title: profile.name,
            startupImage: userAvatar(profile),
        }
    }

    return metadata
}
