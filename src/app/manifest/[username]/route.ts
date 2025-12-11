import { NextRequest } from 'next/server'

import { userProfile } from '@/actions/user'
import { createClient } from '@/supabase/server'
import { userAvatar } from '@/lib/utils'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params

        const data = await userProfile(username)
        if (!data || !data.user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const profile = data.user

        if (profile.role !== 2 && profile.role !== 3) {
            return new Response(JSON.stringify({ error: 'Not a shopkeeper' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const supabase = await createClient()
        const { data: auth } = await supabase.auth.getClaims()
        const currentUserId = auth?.claims?.sub

        let isOwner = false
        if (currentUserId) {
            isOwner = profile.id === currentUserId
        }

        const shortcuts = []

        if (isOwner) {
            if (profile.role === 3) {
                shortcuts.push({
                    name: 'Brands',
                    short_name: 'Brands',
                    description: 'Manage brands',
                    url: `/@${profile.username}/brands`,
                    icons: [{ src: '/shortcut/brand.png', sizes: '192x192' }],
                })
                shortcuts.push({
                    name: 'Categories',
                    short_name: 'Categories',
                    description: 'Manage categories',
                    url: `/@${profile.username}/categories`,
                    icons: [{ src: '/shortcut/category.png', sizes: '192x192' }],
                })
            }

            shortcuts.push(
                {
                    name: 'Products',
                    short_name: 'Products',
                    description: `View ${profile.name}'s products`,
                    url: `/@${profile.username}/products`,
                    icons: [{ src: '/shortcut/products.png', sizes: '192x192' }],
                },
                {
                    name: 'POS',
                    short_name: 'POS',
                    description: 'Point of Sale',
                    url: `/@${profile.username}/pos`,
                    icons: [{ src: '/shortcut/pos.png', sizes: '192x192' }],
                },
                {
                    name: 'Settings',
                    short_name: 'Settings',
                    description: 'Account settings',
                    url: `/@${profile.username}/settings`,
                    icons: [{ src: '/shortcut/settings.png', sizes: '192x192' }],
                }
            )
        } else {
            // PUBLIC SHORTCUTS
            shortcuts.push({
                name: 'Products',
                short_name: 'Products',
                description: `View ${profile.name}'s products`,
                url: `/@${profile.username}?tab=products`,
                icons: [{ src: '/shortcut/products.png', sizes: '192x192' }],
            })
        }

        // 5. Build Manifest
        const manifest = {
            name: profile.name,
            short_name: profile.name,
            description: `Shop with ${profile.name} on Fix iT Rock - Mobile Solutions & E-commerce`,
            start_url: `/@${profile.username}`,
            scope: `/@${profile.username}`,
            display: 'standalone',
            display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
            orientation: 'natural',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            icons: [
                {
                    src: userAvatar(profile),
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: userAvatar(profile),
                    sizes: '384x384',
                    type: 'image/png',
                },
                {
                    src: userAvatar(profile),
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
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
