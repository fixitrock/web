import { checkAuth } from '@/actions/auth'
import { Category } from './category'
interface PageProps {
    params: {
        user: string
    }
}

export async function Categories({ params }: PageProps) {
    const { can } = await checkAuth(params.user)
    return <Category can={can} />
}
