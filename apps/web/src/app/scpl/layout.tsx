import { Metadata } from 'next'

import { siteConfig } from '@/config/site'

export default function Layout({ children }: { children: React.ReactNode }) {
    return <main className='mx-auto mb-10 space-y-10 p-1 py-4 sm:p-4 2xl:px-[10%]'>{children}</main>
}

export const metadata: Metadata = {
    title: 'Mobile Repair Parts Service Centers',
    description:
        'Discover genuine repair parts and authorized service center locations for top mobile brands. Get the best prices for spare parts and repairs.',
    keywords:
        'mobile repair parts, authorized service centers, genuine mobile parts, smartphone repair, mobile brands service, phone parts pricing, Samsung repair parts, iPhone service center, mobile phone repair cost, mobile parts shop',

    authors: [
        {
            name: 'Rock Star 💕',
            url: 'https://rockstar.bio',
        },
    ],
    publisher: 'Rock Star 💕',
    openGraph: {
        title: 'Mobile Repair Parts  Service Centers',
        url: new URL(siteConfig.domain),
        type: 'website',
        images: `/repair.png`,
        siteName: siteConfig.title,
    },
}
