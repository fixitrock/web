import { User } from '@/app/login/types'
import { RecentOrders, RecentOrderSkeleton } from './recent'
import { Suspense } from 'react'
import { CanType } from '@/actions/auth'
import { LucideIcon, Store } from 'lucide-react'
import { sellerRecentOrders, sellerTop } from '@/actions/user'
import { TopSection, TopSectionSkeleton } from './top'

interface ActivityTabProps {
    user: User
    can: CanType
}

export function ActivityTab({ user }: ActivityTabProps) {
    const show = [2, 3].includes(user.role as number)

    return (
        <div className='space-y-4'>
            {show && (
                <>
                    <TopTitle title='Recent Orders' icon={Store} iconColor='text-amber-400'>
                        <Suspense fallback={<RecentOrderSkeleton />}>
                            <Recent username={user.username} />
                        </Suspense>
                    </TopTitle>
                    <Suspense fallback={<TopSectionSkeleton />}>
                        <Top username={user.username} />
                    </Suspense>
                </>
            )}
        </div>
    )
}

async function Recent({ username }: { username: string }) {
    const recent = await sellerRecentOrders(username)
    return <RecentOrders recent={recent} />
}

async function Top({ username }: { username: string }) {
    const top = await sellerTop(username)
    return <TopSection top={top} />
}

interface TopProps {
    title: string
    icon: LucideIcon
    iconColor: string
    children?: React.ReactNode
}

function TopTitle({ title, icon: Icon, iconColor, children }: TopProps) {
    return (
        <div className='w-full space-y-2'>
            <div className='flex items-center justify-between px-1'>
                <div className='flex items-center gap-2'>
                    <Icon className={`size-5 ${iconColor}`} />
                    <h3 className='text-lg font-semibold tracking-tight'>{title}</h3>
                </div>
            </div>
            {children}
        </div>
    )
}
