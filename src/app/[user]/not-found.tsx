'use client'

import { Button } from '@heroui/react'
import { Undo2, User } from 'lucide-react'
import Link from 'next/link'

export default function UserNotFound() {
    return (
        <div className='flex min-h-screen items-center justify-center dark:from-gray-900 dark:to-gray-800'>
            <div className='relative px-4 text-center'>
                <div className='absolute -top-20 -left-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20' />
                <div className='absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/20' />
                <div className='relative'>
                    <div className='mb-4 flex justify-center'>
                        <User className='animate-pulse text-gray-800 dark:text-white' size={64} />
                    </div>
                    <div className='mx-auto mb-8 h-1 w-24 rounded-full bg-linear-to-r from-blue-500 to-purple-500' />
                    <h2 className='mb-4 text-3xl font-semibold text-gray-700 dark:text-gray-200'>
                        User Not Found
                    </h2>
                    <p className='mx-auto mb-8 text-balance text-gray-600 dark:text-gray-400'>
                        The user profile you're looking for doesn't exist or is not available.
                    </p>
                    <Button as={Link} color='primary' href='/' startContent={<Undo2 size={20} />}>
                        Home
                    </Button>
                </div>
            </div>
        </div>
    )
}
