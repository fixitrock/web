import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { createClient } from '@/supabase/server'
import { userAvatar } from '@/lib/utils'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()

    const { data: users, error } = await supabase.rpc('sitemap_users')

    if (error) {
        console.error('Sitemap RPC Error:', error)
    }

    const userUrls =
        users?.map((user: any) => {
            const avatar = userAvatar(user)
            const imageUrl = avatar.startsWith('http') ? avatar : `${siteConfig.domain}${avatar}`

            return {
                url: `${siteConfig.domain}/@${user.username}`,
                lastModified: user.updated_at ? new Date(user.updated_at) : new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
                images: [imageUrl],
            }
        }) || []

    const staticRoutes = siteConfig.suggestion.map((route) => ({
        url: `${siteConfig.domain}${route.href}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route.href === '/' ? 1 : 0.8,
    }))

    return [...userUrls, ...staticRoutes]
}
