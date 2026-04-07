import type { Metadata } from 'next'

import { redirect } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { userSession } from '@/actions/user'

import { LoginModal } from './ui/modal'

export default async function LoginPage() {
    const { user } = await userSession()

    if (user) {
        redirect('/')
    }

    return <LoginModal />
}

export const metadata: Metadata = {
    title: `Login`,
    description:
        'Secure login to access your Fix iT Rock account and manage your mobile firmware, drivers, and tools.',
    openGraph: {
        title: `Login - ${siteConfig.title}`,
        description:
            'Secure login to access your Fix iT Rock account and manage your mobile firmware, drivers, and tools.',
        url: `${siteConfig.domain}/login`,
        siteName: siteConfig.title,
        type: 'website',
        images: '/space/og',
        locale: 'en_US',
    },
    alternates: {
        canonical: `${siteConfig.domain}/login`,
    },
}
