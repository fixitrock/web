'use client'

import { useState } from 'react'
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Quote, Share } from 'lucide-react'
import { Button, Card } from '@heroui/react'
import { User as HeroUser } from '@heroui/user'

import { User } from '@/app/login/types'
import { Verified } from '@/ui/icons'
import { QuoteSkeleton } from '@/ui/skeleton'
import { cn, formatDateTime, userAvatar } from '@/lib/utils'
import { useQuote } from '@tanstack/query'

interface QuoteCardProps {
    quote: {
        id: number
        quote: string
        username: string
        lastModifiedDateTime: string
        comments?: number
        likes?: number
    }
    user: User
}

function QuoteCard({ quote, user }: QuoteCardProps) {
    const [isLiked, setIsLiked] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: `Quote by @${quote.username}`,
                text: quote.quote,
                url: window.location.href,
            })
        } else {
            await navigator.clipboard.writeText(`"${quote.quote}" - @${quote.username}`)
        }
    }

    return (
        <Card className='rounded-none border-b bg-transparent p-0 md:rounded-xl md:border md:shadow-none'>
            <Card.Header className='flex w-full justify-between'>
                <HeroUser
                    avatarProps={{
                        src: userAvatar(user),
                        fallback: user.name,
                    }}
                    className='flex justify-start px-2 text-sm font-semibold sm:px-0'
                    description={`@${user.username} - ${formatDateTime(quote.lastModifiedDateTime)}`}
                    name={
                        <span className='flex items-center gap-1'>
                            {user.name}
                            {user.verified ? <Verified className='size-4' /> : null}
                        </span>
                    }
                />
                <Button
                    isIconOnly
                    className='text-default-400 hover:text-default-600 transition-colors'
                    size='sm'
                    variant='ghost'
                >
                    <MoreHorizontal size={18} />
                </Button>
            </Card.Header>

            <Card.Content className='relative h-52 p-0 px-2 select-none'>
                <div className='bg-surface dark:bg-muted/30 relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl'>
                    <Quote
                        className='text-muted-foreground pointer-events-none absolute top-4 left-4 rotate-185'
                        size={18}
                    />
                    <Quote
                        className='text-muted-foreground pointer-events-none absolute right-4 bottom-4 rotate-3'
                        size={18}
                    />

                    <div className='relative z-10 flex h-full w-full items-center justify-center p-4'>
                        <blockquote className='w-full max-w-full text-center'>
                            <p
                                className={cn(
                                    'selection:bg-primary/20 text-foreground leading-relaxed font-medium tracking-wide italic',
                                    quote.quote.length <= 60
                                        ? 'text-xl md:text-2xl lg:text-3xl'
                                        : quote.quote.length <= 120
                                          ? 'text-base md:text-lg lg:text-xl'
                                          : 'text-sm md:text-base lg:text-lg'
                                )}
                            >
                                <span className={cn('wrap-break-word hyphens-auto', 'line-clamp-4')}>
                                    {quote.quote}
                                </span>
                            </p>
                        </blockquote>
                    </div>
                </div>
            </Card.Content>

            <Card.Footer className='flex w-full items-center justify-between'>
                <Button
                    className='text-default-500 transition-all duration-200 hover:bg-blue-500/10 hover:text-blue-500'
                    size='sm'
                    variant='ghost'
                >
                    <MessageCircle size={18} />
                    <span className='text-sm'>{quote.comments ?? 0}</span>
                </Button>

                <Button
                    className={cn(
                        'transition-colors duration-200',
                        isLiked
                            ? 'text-red-500 hover:bg-red-500/10 hover:text-red-600'
                            : 'text-default-500 hover:bg-red-500/10 hover:text-red-500'
                    )}
                    size='sm'
                    variant='ghost'
                    onPress={() => setIsLiked((current) => !current)}
                >
                    <Heart className={cn(isLiked && 'fill-current')} size={18} />
                    <span className='text-sm'>{quote.likes ?? 0}</span>
                </Button>

                <Button
                    className='text-default-500 transition-colors duration-200 hover:bg-green-500/10 hover:text-green-500'
                    size='sm'
                    variant='ghost'
                    onPress={handleShare}
                >
                    <Share size={18} />
                </Button>

                <Button
                    className={cn(
                        'transition-colors duration-200',
                        isBookmarked
                            ? 'text-blue-500 hover:bg-blue-500/10 hover:text-blue-600'
                            : 'text-default-500 hover:bg-blue-500/10 hover:text-blue-500'
                    )}
                    size='sm'
                    variant='ghost'
                    onPress={() => setIsBookmarked((current) => !current)}
                >
                    <Bookmark className={cn(isBookmarked && 'fill-current')} size={18} />
                </Button>
            </Card.Footer>
        </Card>
    )
}

export function Quotes({ user }: { user: User }) {
    const { data, isLoading } = useQuote()

    return (
        <div className='grid grid-cols-1 pt-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-4'>
            {isLoading ? <QuoteSkeleton /> : data?.map((quote) => <QuoteCard key={quote.id} quote={quote} user={user} />)}
        </div>
    )
}
