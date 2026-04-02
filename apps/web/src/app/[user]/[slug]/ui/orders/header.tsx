'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CanType } from '@/actions/auth'
import { Input } from '@/app/(space)/ui'
import { Button } from '@heroui/react'
import { Navbar } from '@heroui/navbar'
import { ChevronLeft } from 'lucide-react'

export function OrdersHeader({ can, username }: { can: CanType; username: string }) {
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()

    return (
        <Navbar
            shouldHideOnScroll
            className='h-auto w-full flex-col gap-2 p-2 md:flex-row md:gap-4'
            maxWidth='full'
        >
            <div className='flex w-full items-center justify-between gap-1 md:w-auto md:justify-baseline'>
                <Button
                    className='h-8 w-8 min-w-0 rounded-full p-0'
                    size='sm'
                    variant='ghost'
                    onPress={() => router.push(`/@${username}`)}
                >
                    <ChevronLeft size={20} />
                </Button>
                <h1 className='text-xl font-bold'>Orders</h1>
                <div className='size-8 md:hidden' />
            </div>
            <div
                className={`${can.create.product ? 'lg:w-[30%]' : 'lg:w-[20%]'} flex w-full items-center gap-4 md:w-[50%]`}
            >
                <Input
                    hotKey='O'
                    placeholder='Search Orders . . . '
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </Navbar>
    )
}
