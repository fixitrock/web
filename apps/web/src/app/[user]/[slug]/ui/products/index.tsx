import { checkAuth } from '@/actions/auth'
import { ProductsPage } from './card'

interface ProductsProps {
    params: {
        user: string
    }
}

export default async function Products({ params }: ProductsProps) {
    const { can } = await checkAuth(params.user)
    return (
        <div className='gap-1.5 p-2 2xl:px-[10%]'>
            <ProductsPage can={can} username={params.user} />
        </div>
    )
}
