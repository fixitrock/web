import { Suspense } from 'react'
import { Metadata } from 'next'

import { getData } from '@/actions/supabase'
import { siteConfig } from '@/config/site'
import { FRP as Types } from '@/types/frp'

import FRPCard from './card'
import { FRPSkeleton } from '@/ui/skeleton'

export default function Page() {
    return (
        <main className='mx-auto w-full max-w-3xl p-2 2xl:px-[2rem]'>
            <Suspense fallback={<FRPSkeleton />}>
                <FRP />
            </Suspense>
        </main>
    )
}

async function FRP() {
    const data = await getData<Types>('frp')

    return <FRPCard data={data} />
}

export const metadata: Metadata = {
    title: 'FRP Bypass',
    description:
        'Professional FRP bypass tools and methods to unlock Android devices. Remove Google Factory Reset Protection (FRP) with our comprehensive guide and trusted solutions for Samsung, Xiaomi, and other Android devices.',
    keywords: [
        'FRP bypass',
        'Factory Reset Protection bypass',
        'Google FRP unlock',
        'Android FRP removal',
        'Samsung FRP bypass',
        'Xiaomi FRP unlock',
        'FRP bypass tools',
        'Google account lock removal',
        'Android device unlock',
        'FRP unlock guide',
        'bypass Google verification',
        'FRP removal methods',
        'Android FRP solutions',
        'unlock locked Android',
        'FRP bypass software',
        'Google lock bypass',
        'Android FRP reset',
        'FRP unlock tutorial',
        'bypass FRP lock',
        'Android FRP tools',
        'FRP bypass APK',
        'remove Google FRP',
        'Android FRP fix',
        'FRP unlock methods',
        'bypass Google account verification',
    ],
    authors: [
        {
            name: 'Rock Star 💕',
            url: 'https://rockstar.bio',
        },
    ],
    publisher: 'Rock Star 💕',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: `${siteConfig.domain}/frp`,
    },
    openGraph: {
        title: 'FRP Bypass',
        description:
            'Professional FRP bypass tools and methods to unlock Android devices. Remove Google Factory Reset Protection with our comprehensive guide and trusted solutions.',
        url: `${siteConfig.domain}/frp`,
        type: 'website',
        images: [
            {
                url: `/space/og?slug=/FRP-Files`,
                width: 1200,
                height: 630,
                alt: 'FRP Bypass Tools - Unlock Android Devices',
            },
        ],
        siteName: siteConfig.title,
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FRP Bypass Tools - Unlock Android Devices',
        description:
            'Professional FRP bypass tools and methods to unlock Android devices. Remove Google Factory Reset Protection with our comprehensive guide.',
        images: [`/space/og?slug=/FRP-Files`],
        creator: '@rockstar',
    },
    category: 'Technology',
    classification: 'Android Tools',
    other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
}
