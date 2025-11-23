import { checkAuth } from '@/actions/auth'
import { OrdersPage } from './order'

interface PageProps {
    params: {
        user: string
    }
}

export async function Orders({ params }: PageProps) {
    const { can } = await checkAuth(params.user)
    return (
        <div className='2xl:px-[10%]'>
            <OrdersPage can={can} username={params.user} />
        </div>
    )
}

