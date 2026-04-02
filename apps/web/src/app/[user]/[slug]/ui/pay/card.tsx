'use client'

import { userAvatar } from '@/lib/utils'
import { User } from '@/app/login/types'
import { Button, Card } from '@heroui/react'
import Image from 'next/image'
export default function PayUi({ user }: { user: User }) {
    const upi = 'sachinpu89969@naviaxis'
    const upiLink = `upi://pay?${upi.toString()}`

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        upiLink
    )}`
    return (
        <Card className='mx-auto max-w-sm'>
            <Card.Header className='justify-center gap-2'>
                <div className='bg-default/20 dark:bg-default/40 size-18 overflow-hidden rounded-full border p-1 backdrop-blur'>
                    <Image
                        alt={`${user.name} avatar`}
                        src={userAvatar(user)}
                        fill
                        className='rounded-full object-cover'
                        sizes='(max-width: 768px) 112px, 144px'
                    />
                </div>
                <div>
                    <p className='text-muted-foreground text-sm'>Paying to</p>
                    <h2 className='text-lg font-semibold'>{user.name}</h2>
                    <p className='text-muted-foreground'>{user.phone}</p>
                </div>
            </Card.Header>
            <Card.Content className='h-44'>
                <Image
                    alt={`${user.name} avatar`}
                    src={qrUrl}
                    fill
                    className='h-44 w-44 sm:h-48 sm:w-48'
                />
            </Card.Content>
            <Card.Footer>
                <Button
                    fullWidth
                    className='bg-green-600 font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]'
                >
                    Pay Now
                </Button>
            </Card.Footer>
        </Card>
    )
}

