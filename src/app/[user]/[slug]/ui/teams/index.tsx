import { User } from '@/app/login/types'
import { userSession } from '@/actions/user'

import Members from './members'

export async function Teams() {
    const { user } = await userSession()

    return (
        <div className='flex w-full flex-col gap-4 p-2 md:px-4 2xl:px-[10%]'>
            <Members user={user as User} />
        </div>
    )
}
