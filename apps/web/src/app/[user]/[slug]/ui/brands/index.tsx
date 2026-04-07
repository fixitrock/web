import { checkAuth } from '@/actions/auth'
import { Brand } from './brand'

interface PageProps {
    params: {
        user: string
    }
}

export async function Brands({ params }: PageProps) {
    const { can } = await checkAuth(params.user)
    return <Brand can={can} />
}
