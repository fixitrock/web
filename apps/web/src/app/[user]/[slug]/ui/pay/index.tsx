import { userProfile } from '@/actions/user'
import PayUi from './card'

interface PageProps {
    params: {
        user: string
    }
}

export async function Pay({ params }: PageProps) {
    const { user } = await params
    const cleanUsername = decodeURIComponent(user).replace(/^@/, '')
    const data = await userProfile(cleanUsername)
    return (
        <div>
            <PayUi user={data?.user} />
            {/* <pre>{JSON.stringify({ data }, null, 2)}</pre> */}
        </div>
    )
}
