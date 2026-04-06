'use client'

import { Link } from '@heroui/react'
import { siteConfig } from '../config'
import { ThemeSwitcher } from './theme'

export function Footer() {
    return (
        <footer className='w-full border-t'>
            <div className='mx-auto flex w-full max-w-7xl items-center justify-between p-4'>
                <Link
                    className='font-mono font-bold tracking-tighter no-underline select-none'
                    href='/'
                >
                    {siteConfig.title}
                </Link>
                <div className='flex items-center gap-4'>
                    <ThemeSwitcher />
                </div>
            </div>
        </footer>
    )
}
