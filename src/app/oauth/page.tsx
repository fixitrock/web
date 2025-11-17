import { redirect } from 'next/navigation'

import { generateMicrosoftAuthUrl, handleOAuthCallback } from '@/actions/space/oauth'

type OAuthPageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function OAuthPage({ searchParams }: OAuthPageProps) {
    const params = await searchParams
    const code = (params?.code as string) || undefined
    const state = (params?.state as string) || undefined
    const returnUrl = (params?.return as string) || undefined

    if (!code) {
        // Start OAuth by redirecting to Microsoft login with optional returnUrl
        const authUrl = await generateMicrosoftAuthUrl(returnUrl)
        redirect(authUrl)
    }

    // We have a code -> exchange for tokens and store
    try {
        await handleOAuthCallback(code)

        // Prefer the state from Microsoft callback (original value we set), else fallback to ?return or /space
        const target = state ? decodeURIComponent(state) : returnUrl || '/space'
        redirect(target)
    } catch (error) {
        // If OAuth fails, redirect to space with error
        const errorMessage = error instanceof Error ? error.message : 'OAuth failed'
        redirect(`/space?error=${encodeURIComponent(errorMessage)}`)
    }
}
