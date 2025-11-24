import { NextRequest } from 'next/server'

import { getUser } from '@/actions/user'
import { createClient } from '@/supabase/server'
import { userAvatar } from '@/lib/utils'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params
        const user = await getUser(username)

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        if (user.role !== 2 && user.role !== 3) {
            return new Response(JSON.stringify({ error: 'Not a shopkeeper' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const supabase = await createClient()
        const { data } = await supabase.auth.getClaims()
        const currentUserId = data?.claims?.sub

        let isOwner = false

        if (currentUserId) {
            const { data: currentUser } = await supabase
                .from('users')
                .select('username')
                .eq('id', currentUserId)
                .single()
            isOwner = currentUser?.username === username
        }

        const shortcuts: Array<{
            name: string
            short_name: string
            description: string
            url: string
            icons: Array<{ src: string; sizes: string }>
        }> = []

        if (isOwner) {
            if (user.role === 3) {
                shortcuts.push({
                    name: 'Brands',
                    short_name: 'Brands',
                    description: 'Manage brands',
                    url: `/@${user.username}/brands`,
                    icons: [{ src: '/shortcut/brand.png', sizes: '192x192' }],
                })
                shortcuts.push({
                    name: 'Categories',
                    short_name: 'Categories',
                    description: 'Manage categories',
                    url: `/@${user.username}/categories`,
                    icons: [{ src: '/shortcut/category.png', sizes: '192x192' }],
                })
            }

            shortcuts.push({
                name: 'Products',
                short_name: 'Products',
                description: `View ${user.name}'s products`,
                url: `/@${user.username}/products`,
                icons: [{ src: '/shortcut/products.png', sizes: '192x192' }],
            })

            shortcuts.push({
                name: 'POS',
                short_name: 'POS',
                description: 'Point of Sale',
                url: `/@${user.username}/pos`,
                icons: [{ src: '/shortcut/pos.png', sizes: '192x192' }],
            })

            shortcuts.push({
                name: 'Settings',
                short_name: 'Settings',
                description: 'Account settings',
                url: `/@${user.username}/settings`,
                icons: [{ src: '/shortcut/settings.png', sizes: '192x192' }],
            })
        } else {
            shortcuts.push({
                name: 'Products',
                short_name: 'Products',
                description: `View ${user.name}'s products`,
                url: `/@${user.username}?tab=products`,
                icons: [{ src: '/shortcut/products.png', sizes: '192x192' }],
            })
        }

        const manifest = {
            name: user.name,
            short_name: user.name,
            description: `Shop with ${user.name} on Fix iT Rock - Mobile Solutions & E-commerce`,
            start_url: `/@${user.username}`,
            scope: `/@${user.username}`,
            display: 'standalone',
            display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
            orientation: 'natural',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            icons: [
                {
                    src: userAvatar(user),
                    sizes: '192x192',
                    type: 'image/png',
                    
                },
                {
                    src: userAvatar(user),
                    sizes: '384x384',
                    type: 'image/png',
                   
                },
                {
                    src: userAvatar(user),
                    sizes: '512x512',
                    type: 'image/png',
                   
                },
            ],
            categories: ['business', 'shopping', 'utilities'],
            lang: 'en',
            dir: 'ltr',
            prefer_related_applications: false,
            shortcuts,
        }

        return new Response(JSON.stringify(manifest), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600',
            },
        })
    } catch {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
