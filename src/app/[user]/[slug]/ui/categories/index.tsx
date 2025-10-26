import { checkAuth } from '@/actions/auth'
import { Category } from './category'

export async function Categories() {
    const { can } = await checkAuth(['create:category', 'update:category'])
    return <Category can={can} />
}
