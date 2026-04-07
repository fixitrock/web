'use client'

import { Button } from '@heroui/react'
import { FolderX } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NotFound() {
    const pathname = usePathname()
    const parentPath = pathname.split('/').slice(0, -1).join('/') || '/space'

    return (
        <div className='flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 p-4'>
            <div className='flex flex-col items-center gap-4 text-center'>
                <div className='relative'>
                    <div className='absolute -inset-4 rounded-full bg-teal-500/10 blur-xl' />
                    <div className='relative flex h-20 w-20 items-center justify-center rounded-2xl bg-teal-500/10'>
                        <FolderX className='h-10 w-10 text-teal-500' />
                    </div>
                </div>
                <div className='space-y-4'>
                    <h1 className='text-3xl font-bold tracking-tight'>Oops! File Not Found 😅</h1>
                    <p className='text-muted-foreground text-lg'>
                        Looks like this firmware took a wrong turn! Maybe it's still downloading...
                        somewhere in the cloud? ☁️
                    </p>
                </div>
            </div>
            <div className='flex flex-row gap-3'>
                <Button as={Link} href={parentPath} variant='flat'>
                    Back to Space
                </Button>
                <Button as={Link} href='/' variant='flat'>
                    Home
                </Button>
            </div>
            <div className='text-muted-foreground mt-2 text-center text-sm'>
                <Link className='text-teal-500 hover:underline' href='https://wa.me/919927241144'>
                    Need this file? Let us know!
                </Link>
            </div>
        </div>
    )
}
