'use client'

import Image from 'next/image'
import Icon from '@/lib/utils/Icon'
import { cn } from '@/lib/utils'

type ThumbnailProps = {
    src?: string
    name: string
    type: 'Grid' | 'List'
    className?: string
}

export function Thumbnail({ src, name, type, className }: ThumbnailProps) {
    return (
        <div className={cn('flex shrink-0 items-center justify-center', className)}>
            {src ? (
                <Image
                    width={512}
                    height={512}
                    alt={name}
                    className={`${type === 'Grid' ? 'bg-default/5 dark:bg-default/10 aspect-video rounded-md p-2' : 'size-10'} overflow-hidden object-contain`}
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
