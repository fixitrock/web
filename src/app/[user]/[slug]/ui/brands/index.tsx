import { checkAuth } from '@/actions/auth'
import { Brand } from './brand'

export async function Brands() {
    const { can } = await checkAuth(['create:brand', 'update:brand'])
    return <Brand can={can} />
}
