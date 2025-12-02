'use client'

import { User } from '@/app/login/types'
import { RecentOrders } from './recent'
import { useTop } from '@/hooks/tanstack/query'
import { TopCarousel } from './top'

import { Tag, Layers, Package } from 'lucide-react'

interface ActivityTabProps {
    user: User
    canManage: boolean
}

export function ActivityTab({ user, canManage }: ActivityTabProps) {
    const { data, isLoading } = useTop(user.username)
    const show = [2, 3].includes(user.role as number)

    return (
        <div className="py-3 space-y-4">
            {show  && (<>
                <RecentOrders username={user.username} />
   
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TopCarousel
                    title="Brands"
                    icon={Tag}
                    iconColor="text-blue-500"
                    top={data?.top_brands || []}
                    isLoading={isLoading}
                    basis="sm:basis-1/2"
                />

                <TopCarousel
                    title="Categories"
                    icon={Layers}
                    iconColor="text-purple-500"
                    top={data?.top_categories || []}
                    isLoading={isLoading}
                    basis="sm:basis-1/2"
                />
            </div>
            <TopCarousel
                title="Products"
                icon={Package}
                iconColor="text-green-500"
                top={data?.top_products || []}
                isLoading={isLoading}
                basis="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            />
            </>
         )}
        </div>
    )
}
