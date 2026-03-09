'use client'

import { Card, Image } from '@heroui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

export const UL = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => {
    return <ul className={cn('ml-6 list-disc', className)} {...props} />
}

export const OL = ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => {
    return <ol className={cn('ml-6 list-decimal', className)} {...props} />
}

export const LI = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    return <li className={cn('mt-2', className)} {...props} />
}

export const Blockquote = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    return (
        <Card className={cn('dark:bg-default/10 rounded-lg border p-1.5', className)} shadow='none'>
            <blockquote
                className={cn('ml-1 border-l-2 border-[hsl(var(--ring))] pl-4 italic', className)}
                {...props}
            />
        </Card>
    )
}

export const HR = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => {
    return <hr className={cn('border-border my-2 sm:my-6', className)} {...props} />
}

export const A = ({ className, ...props }: React.ComponentProps<typeof Link>) => {
    return (
        <Link
            className={cn(
                'underline decoration-[hsl(var(--ring))] decoration-wavy underline-offset-4',
                className
            )}
            {...props}
        />
    )
}

type Props = {
    src: string
    alt?: string
    width?: string
    height?: string
}

export const IMG = ({ src, alt, width, height }: Props) => {
    return (
        <Image
            isBlurred
            removeWrapper
            alt={alt}
            className='mx-auto my-2'
            height={height}
            loading='lazy'
            radius='lg'
            src={src}
            width={width}
        />
    )
}

export function Title() {
    const pathname = usePathname()
    const title =
        pathname?.split('/').filter(Boolean).pop()?.replaceAll('-', ' ').replaceAll('_', ' ') || ''

    return <>{title}</>
}

export function YouTube({ id }: { id: string }) {
    return (
        <div className='relative my-4 h-0 max-w-full overflow-hidden rounded-md pb-[56.25%]'>
            <iframe
                allowFullScreen
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                className='absolute top-0 left-0 h-full w-full'
                src={`https://www.youtube.com/embed/${id}`}
                title='YouTube video player'
            />
        </div>
    )
}
