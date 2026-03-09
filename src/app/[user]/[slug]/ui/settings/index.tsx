import { User } from '@/app/login/types'
import { userSession } from '@/actions/user'

import { Setting } from './setting'

export async function Settings() {
    const { user } = await userSession()

    return <Setting user={user as User} />
}
