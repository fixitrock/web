'use client'
import { Image } from '@heroui/react'
import { motion } from 'motion/react'
import React from 'react'
import { IconType } from 'react-icons/lib'

import { cn } from '@/lib/utils'

export const NotFound = () => {
    return (
        <div className='flex flex-col items-center gap-4 rounded-xl p-4 select-none'>
            <Image
                isBlurred
                alt='Page not found.'
                height={200}
                src='/onedrive/empty_folder_v2.svg'
                width={200}
            />
            <h4 className='text-center font-semibold sm:text-xl'>Page Not Found</h4>
            <p className='text-center text-gray-500'>
                The folder or file you are looking for does not exist or is inaccessible.
            </p>
        </div>
    )
}

export const FolderEmpty = () => {
    return (
        <div className='flex flex-col items-center gap-4 rounded-xl p-4 select-none'>
            <Image
                isBlurred
                alt='This folder is empty.'
                height={200}
                src='/onedrive/empty_folder_v3.webp'
                width={200}
            />
            <h4 className='text-center font-semibold sm:text-xl'>This folder is empty.</h4>
        </div>
    )
}

export const SearchEmpty = ({ query }: { query: string }) => {
    return (
        <div className='flex flex-col items-center gap-4 rounded-xl p-4 select-none'>
            <Image
                isBlurred
                alt='Oops! The folder is empty.'
                className='size-64'
                height={200}
                src='/onedrive/empty_search_v2.svg'
                width={200}
            />
            <h4 className='max-w-full text-center font-semibold break-words sm:text-xl'>
                We couldn&apos;t find any results for <span className='break-words'>{query}</span>
            </h4>
        </div>
    )
}

export default function LimitExceeded() {
    return (
        <div className='mx-auto w-full max-w-2xl rounded-lg bg-white px-6 py-8 text-center shadow-lg sm:px-8 sm:py-10 dark:bg-gray-800'>
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className='mb-4 text-2xl font-extrabold text-gray-800 sm:text-5xl dark:text-gray-200'
                initial={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
            >
                🚧 &quot;Server Says BRB 😜&quot;
            </motion.div>

            <motion.p
                animate={{ opacity: 1 }}
                className='mb-6 text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-400'
                initial={{ opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                Our servers took a coffee break ☕. We&apos;ve hit limits on Supabase and Vercel.
                We&apos;re working on a fix—thanks for your patience!
            </motion.p>

            <motion.div
                animate={{ opacity: 1 }}
                className='mt-6 flex flex-col items-center gap-4'
                initial={{ opacity: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
            >
                <motion.a
                    className='rounded-md bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700'
                    href='https://wa.me/919927241144?text=Hey?'
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Request Files via WhatsApp
                </motion.a>

                <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className='w-full rounded-md bg-gray-100 p-4 text-left text-sm text-gray-800 shadow-md dark:bg-gray-700 dark:text-gray-300'
                    initial={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <p className='mb-2 font-bold'>Available Files:</p>
                    <ul className='list-inside list-disc space-y-1'>
                        <li>Firmware</li>
                        <li>Tools & Utilities</li>
                        <li>EMMC ISP Pinouts</li>
                        <li>ELD Test Points</li>
                    </ul>
                </motion.div>
            </motion.div>

            <motion.div
                animate={{ opacity: 1 }}
                className='mt-8 text-xs text-gray-500 sm:text-sm dark:text-gray-400'
                initial={{ opacity: 0 }}
                transition={{ duration: 1.2, delay: 0.6 }}
            >
                Thanks for sticking with us! We’ll be back soon, stronger and caffeinated! ☕
            </motion.div>
        </div>
    )
}

interface ErrorStateProps {
    title?: string
    message?: string
    className?: string
    icons?: IconType[]
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title,
    message,
    className,
    icons = [],
}) => {
    return (
        <div
            className={cn(
                'group flex w-full flex-col items-center gap-6 rounded-xl border py-12 text-center transition-all duration-300 select-none',
                className
            )}
        >
            <div className='isolate flex justify-center gap-4'>
                {icons.length === 3 ? (
                    <>
                        <div className='bg-background ring-border relative top-1 left-3 grid size-14 -rotate-6 place-items-center rounded-lg shadow-md ring-1 transition duration-300 group-hover:-translate-x-4 group-hover:-translate-y-0.5'>
                            {React.createElement(icons[0], {
                                className: 'w-7 h-7',
                            })}
                        </div>
                        <div className='bg-background ring-border relative z-10 grid size-14 place-items-center rounded-lg shadow-md ring-1 transition duration-300 group-hover:-translate-y-1'>
                            {React.createElement(icons[1], {
                                className: 'w-7 h-7',
                            })}
                        </div>
                        <div className='bg-background ring-border relative top-1 right-3 grid size-14 rotate-6 place-items-center rounded-lg shadow-md ring-1 transition duration-300 group-hover:translate-x-4 group-hover:-translate-y-1'>
                            {React.createElement(icons[2], {
                                className: 'w-7 h-7',
                            })}
                        </div>
                    </>
                ) : (
                    <div className='bg-background ring-border grid size-14 place-items-center rounded-lg shadow-md ring-1 transition duration-300'>
                        {icons[0] &&
                            React.createElement(icons[0], {
                                className: 'w-7 h-7',
                            })}
                    </div>
                )}
            </div>
            <div className='mt-1 space-y-1.5'>
                <h4 className='text-xl font-extrabold'>{title}</h4>
                <p className='text-muted-foreground text-sm'>{message}</p>
            </div>
        </div>
    )
}
