'use client'

import React from 'react'
import { Image } from '@heroui/react'

import Icon from '@/lib/utils/Icon'

type ThumbnailProps = {
    src?: string
    name: string
    type: 'Grid' | 'List'
}

export function Thumbnail({ src, name, type }: ThumbnailProps) {
    return (
        <div className='flex shrink-0 items-center justify-center'>
            {src ? (
                <Image
                    alt={name}
                    className={`${type === 'Grid' ? 'bg-default/5 dark:bg-default/10 aspect-video h-40 rounded-md p-2' : 'size-10'} object-contain`}
                    isBlurred={type === 'Grid'}
                    loading='lazy'
                    src={src}
                />
            ) : (
                <div
                    className={`${type === 'Grid' ? 'bg-default/5 dark:bg-default/10 flex aspect-video h-40 items-center justify-center rounded-md' : 'flex size-10 items-center'}`}
                >
                    <Icon
                        className={`${type === 'Grid' ? 'size-14!' : 'mx-auto size-7! shrink-0'}`}
                        name={name}
                    />
                </div>
            )}
        </div>
    )
}
