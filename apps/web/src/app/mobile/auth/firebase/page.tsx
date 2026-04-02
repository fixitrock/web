import { FirebaseMobileAuth } from './firebase-mobile-auth'

type PageProps = {
    searchParams: Promise<{
        redirect?: string
        phone?: string
    }>
}

export default async function MobileFirebasePage({ searchParams }: PageProps) {
    const params = await searchParams
    const redirect = params.redirect || ''
    const phone = params.phone || ''

    return <FirebaseMobileAuth redirect={redirect} initialPhone={phone} />
}
