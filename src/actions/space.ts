'use server'

import { Client } from '@microsoft/microsoft-graph-client'

export async function Space() {
    const res = await fetch('https://space.fixitrock.workers.dev/token', {
        method: 'GET',
        headers: {
            'x-api-secret': process.env.API_SECRET!,
        },
        cache: 'no-store',
    })

    const json = await res.json()

    if (!res.ok || json.error) {
        console.error('SpaceClient Error:', json)
        throw new Error(json.error || 'Token fetch failed')
    }

    const accessToken = json.access_token

    const graph = Client.init({
        authProvider: (done) => {
            done(null, accessToken)
        },
    })

    return graph
}
