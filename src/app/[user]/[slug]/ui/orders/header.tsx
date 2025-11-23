'use client'

import { useState } from 'react'
import { CanType } from '@/actions/auth'
import { Input } from '@/app/(space)/ui'
import { Button, Navbar } from '@heroui/react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export function OrdersHeader({ can, username }: { can: CanType; username: string; }) {
    const [searchQuery, setSearchQuery] = useState('')

    return (
            <Navbar
                shouldHideOnScroll
                classNames={{
                    wrapper: 'h-auto w-full flex-col gap-2 p-2 md:flex-row md:gap-4',
                }}
                maxWidth='full'
            >
                <div className='flex w-full items-center justify-between gap-1 md:w-auto md:justify-baseline'>
                    <Button
                        as={Link}
                        className='h-8 w-8 min-w-0 p-0'
                        href={`/@${username}`}
                        radius='full'
                        size='sm'
                        variant='light'
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
                        placeholder='Search Orders . . . '
                        hotKey='O'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </Navbar>
    )
}
