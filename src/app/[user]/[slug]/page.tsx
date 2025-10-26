import { redirect } from 'next/navigation'
import { Metadata } from 'next'

import { getUser, userSession } from '@/actions/user'
import { getSlug } from '@/actions/supabase/getSlug'

import Products from './ui/products'
import { Brands } from './ui/brands'
import { Settings } from './ui/settings'
import { Pos } from './ui/pos'
import { Categories } from './ui/categories'

const components: Record<string, React.ComponentType<{ params: { user: string } }>> = {
    Products: Products,
    Pos: Pos,
    Brands: Brands,
    Categories: Categories,
    Settings: Settings,
}

type Props = {
    params: Promise<{ user: string; slug: string }>
}

export default async function SlugPage({ params }: Props) {
    const { user, slug } = await params
    const cleanUsername = decodeURIComponent(user).replace(/^@/, '')
    const userObj = await getUser(cleanUsername)

    if (!userObj) return redirect('/login')

    const currentUser = await userSession()

    const allowedSlugs = await getSlug(userObj.role || 0)
    const slugConfig = allowedSlugs.find((s) => s && s.slug === slug)

    if (!slugConfig) return redirect(`/@${cleanUsername}`)

    if (
        slugConfig.private &&
        (!currentUser?.user ||
            currentUser.user.username !== cleanUsername ||
            currentUser.user.role !== userObj.role)
    ) {
        return redirect(`/@${cleanUsername}`)
    }

    const SectionComponent = components[slugConfig.component] || (() => <div>Page not found</div>)

    return (
        <>
            <SectionComponent params={{ user: cleanUsername }} />
        </>
    )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { user, slug } = await params
    const cleanUsername = decodeURIComponent(user).replace(/^@/, '')
    const userObj = await getUser(cleanUsername)

    if (!userObj) {
        return {
            title: 'User Not Found',
            description: 'The requested user profile could not be found.',
        }
    }

    const allowedSlugs = await getSlug(userObj.role || 0)
    const slugConfig = allowedSlugs.find((s) => s && s.slug === slug)

    if (!slugConfig) {
        return {
            title: 'Page Not Found',
            description: 'The requested page could not be found.',
        }
    }

    const title = `${slugConfig.title || slug} - ${userObj.name}`

    const description = slugConfig.description
        ? slugConfig.description
              .replace('the user', userObj.name)
              .replace('this user', userObj.name)
        : `View ${slugConfig.title || slug} from ${userObj.name}`

    const metadata: Metadata = {
        title: { absolute: title },
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: userObj.avatar ? [userObj.avatar as string] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: userObj.avatar ? [userObj.avatar as string] : undefined,
        },
        creator: `@${userObj.username}`,
    }

    if (userObj.role === 2 || userObj.role === 3) {
        metadata.manifest = `/manifest/${userObj.username}`
        metadata.appleWebApp = {
            capable: true,
            statusBarStyle: 'black-translucent',
            title: userObj.name,
            startupImage: userObj.avatar || '/fallback/boy.png',
        }
    }

    return metadata
}
