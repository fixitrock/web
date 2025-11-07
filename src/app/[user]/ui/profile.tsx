'use client'

import { Button, Image, useDisclosure } from '@heroui/react'
import React from 'react'
import { ArrowLeft, Calendar, Camera, MapPin, Share } from 'lucide-react'
import Link from 'next/link'
import { FaCamera } from 'react-icons/fa'

import { User } from '@/app/login/types'
import { Verified } from '@/ui/icons'
import { formatDateTime, userAvatar } from '@/lib/utils'
import { bucketUrl } from '@/supabase/bucket'

import { Actions } from './actions'
import AvatarCover from './add'

type ProfileProps = {
    user: User
    canManage: boolean
}

const UserInfo = ({ user }: { user: User }) => (
    <div className='flex flex-col gap-1.5'>
        <h1 className='flex flex-col text-3xl font-bold'>
            <span className='flex items-center gap-2'>
                {user.name} {user.verified && <Verified />}
            </span>
            <p className='text-muted-foreground text-xs'>@{user.username}</p>
        </h1>

        <p className='text-muted-foreground max-w-xl'>{user.bio}</p>
        <div className='text-muted-foreground flex flex-wrap items-center gap-4 text-sm'>
            {user.location && (
                <Link
                    passHref
                    className='flex items-center gap-1'
                    href={user.location_url || ''}
                    target='blank'
                >
                    <MapPin className='h-4 w-4' />
                    {user.location}
                </Link>
            )}
            <div className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                Joined {formatDateTime(user.created_at)}
            </div>
        </div>
    </div>
)

export default function Profile({ user, canManage }: ProfileProps) {
    const [isFollowing, setIsFollowing] = React.useState(false)
    const [editMode, setEditMode] = React.useState<'avatar' | 'cover'>('avatar')
    const handleFollow = () => setIsFollowing(!isFollowing)
    const handleMessage = () =>
        window.open(
            `https://api.whatsapp.com/send/?phone=${user.phone.replace(/^\+/, '')}`,
            '_blank'
        )

    function handleShare() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: 'Check this out!',
                url: window.location.href,
            })
        }
    }
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

    const handleAvatarEdit = () => {
        setEditMode('avatar')
        onOpen()
    }

    const handleCoverEdit = () => {
        setEditMode('cover')
        onOpen()
    }

    return (
        <>
            <div className='relative'>
                <Image
                    disableSkeleton
                    alt={`${user.name} cover`}
                    className='h-30 w-full rounded-none border-b object-cover lg:h-60'
                    radius='none'
                    src={
                        (bucketUrl(user.cover as string) || '/fallback/cover.png') +
                        (user.updated_at ? `?t=${user.updated_at}` : '')
                    }
                />
                {canManage && (
                    <Button
                        isIconOnly
                        className='absolute right-3 bottom-3 z-20 bg-black/30 text-white'
                        radius='full'
                        size='sm'
                        startContent={<FaCamera size={18} />}
                        onPress={handleCoverEdit}
                    />
                )}
                <AvatarCover
                    isOpen={isOpen}
                    mode={editMode}
                    onClose={onClose}
                    onOpenChange={onOpenChange}
                />
                <div className='absolute top-0 z-10 flex w-full justify-between p-2 md:hidden'>
                    <Button
                        isIconOnly
                        passHref
                        as={Link}
                        className='bg-black/20 text-white'
                        href='/'
                        radius='full'
                        size='sm'
                        startContent={<ArrowLeft size={20} />}
                    />
                    <Button
                        isIconOnly
                        className='bg-black/20 text-white'
                        radius='full'
                        size='sm'
                        startContent={<Share size={20} />}
                        onPress={handleShare}
                    />
                </div>
            </div>
            <div className='relative z-10 flex w-full flex-col px-[5%] lg:px-[10%]'>
                <div className='flex w-full justify-between gap-4'>
                    <div className='bg-background relative -top-20 shrink-0 rounded-full border p-1 md:-top-16'>
                        <Image
                            isBlurred
                            alt={`${user.name} avatar`}
                            className='size-32 object-cover md:size-36'
                            classNames={{
                                wrapper:
                                    'bg-default/20 dark:bg-default/40 size-32 overflow-hidden rounded-full backdrop-blur md:size-36',
                            }}
                            src={userAvatar(user)}
                        />
                        {canManage && (
                            <Button
                                isIconOnly
                                className='absolute right-2 bottom-2 z-20 bg-black/20 text-white'
                                radius='full'
                                size='sm'
                                startContent={<Camera />}
                                onPress={handleAvatarEdit}
                            />
                        )}
                    </div>
                    <div className='mt-2 flex w-full flex-1 justify-end'>
                        <div className='hidden w-full md:flex'>
                            <UserInfo user={user} />
                        </div>
                        <Actions
                            canManage={canManage}
                            isFollowing={isFollowing}
                            user={user}
                            onFollow={handleFollow}
                            onMessage={handleMessage}
                        />
                    </div>
                </div>
                <div className='relative -top-16 md:hidden'>
                    <UserInfo user={user} />
                </div>
            </div>
        </>
    )
}
