import { Suspense } from 'react'
import { Metadata } from 'next'

import { GridSkeleton } from '@/ui/skeleton'
import { siteConfig } from '@/config/site'
import { getChildren } from '@/actions/drive'
import { userSession } from '@/actions/user'

import { Grid } from '../ui'

export default function SpacePage() {
    return (
        <main className='flex w-full flex-col gap-4 p-2 md:p-4 2xl:px-[10%]'>
            <Suspense
                fallback={
                    <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4'>
                        <GridSkeleton />
                    </div>
                }
            >
                <Space />
            </Suspense>
        </main>
    )
}

export const metadata: Metadata = {
    title: 'Space - Mobile & Computer Repair Resources',
    description:
        'Download mobile repair tools, firmware files, FRP bypass tools, and Windows drivers. A free and comprehensive resource for phone and computer technicians.',
    keywords: [
        'flash tool download',
        'firmware files free',
        'FRP bypass tool',
        'EMMC ISP pinout',
        'Samsung MDM bypass',
        'Windows repair drivers',
        'Android flashing tools',
        'mobile repair tools',
        'fixitrock downloads',
    ],

    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: `Space - ${siteConfig.title}`,
        startupImage: ['/icons/fixitrock.png'],
    },
    icons: {
        icon: '/favicon.ico',
    },
    metadataBase: new URL(siteConfig.domain),
    openGraph: {
        title: `${siteConfig.title}: Your Space for Repair Tools`,
        description:
            'Download mobile repair tools, firmware files, FRP bypass tools, and Windows drivers. A free and comprehensive resource for phone and computer technicians.',
        url: `${siteConfig.domain}/space`,
        siteName: siteConfig.title,
        type: 'website',
        images: '/space/og',
    },
    category: 'technology',
}
async function Space() {
    try {
        const data = await getChildren('')

        const { user } = await userSession()

        return <Grid data={data} userRole={user?.role} />
    } catch (error) {
        throw error
    }
}

