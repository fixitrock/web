import type { SiteFallback } from './site.types'

export const fallback = {
    order: 'https://cdn3d.iconscout.com/3d/premium/thumb/packages-3d-icon-png-download-5299181.png',
    recentOrder:
        'https://cdn3d.iconscout.com/3d/premium/thumb/order-accepted-3d-icon-png-download-5640162.png',
    brand: 'https://cdn3d.iconscout.com/3d/premium/thumb/astronaut-riding-rocket-while-waiving-hand-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--hello-logo-gesture-pack-aerospace-illustrations-4431886.png',
    brandSearch: '/fallback/categorySearch.png',
    category: '/fallback/category.png',
    categorySearch: '/fallback/categorySearch.png',
    user: 'https://avatar.vercel.sh/',
} satisfies SiteFallback

export type Fallback = typeof fallback
