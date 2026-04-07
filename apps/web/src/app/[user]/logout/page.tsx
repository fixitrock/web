import { redirect } from 'next/navigation'
import { userSession } from '@/actions/user'
import Logout from './logout'

export default async function LogoutPage() {
    const { user } = await userSession()
    if (!user) {
        redirect('/')
    }

    return <Logout />
}
