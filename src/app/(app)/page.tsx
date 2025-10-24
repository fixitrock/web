import { userSession } from '@/actions/user'
import Text from '@/ui/text'

import { Tags } from './tags'

export default async function Page() {
    const { user, navigation } = await userSession()

    return (
        <main className='m-auto flex h-[calc(100vh-78px)] flex-col items-center justify-center'>
            <div className='flex w-full max-w-xl flex-col items-center gap-4 px-3 sm:px-2 md:gap-6'>
                <h1 className='text-foreground text-center text-2xl font-extrabold sm:text-3xl sm:text-nowrap md:text-5xl'>
                    {user ? (
                        <>
                            {getGreeting()}&nbsp;
                            <span className='bg-gradient-to-r from-fuchsia-500 via-amber-400 to-cyan-400 bg-clip-text font-extrabold text-transparent drop-shadow-md'>
                                {user.name}
                            </span>
                        </>
                    ) : (
                        <>
                            Welcome to <Text />
                        </>
                    )}
                </h1>
                <Tags navigation={navigation} />
            </div>
        </main>
    )
}

function getGreeting() {
    const hour = new Date().getHours()

    if (hour >= 0 && hour < 4) return 'Good Night'
    if (hour >= 4 && hour < 12) return 'Good Morning'
    if (hour >= 12 && hour < 17) return 'Good Afternoon'
    if (hour >= 17 && hour < 21) return 'Good Evening'

    return 'Good Night'
}
