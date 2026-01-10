'use client'

import { Button, useDisclosure } from '@heroui/react'
import React from 'react'
import { ArrowLeft, Camera, Share } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FaCamera } from 'react-icons/fa'

import { User } from '@/app/login/types'
import { Verified } from '@/ui/icons'
import { userAvatar } from '@/lib/utils'
import { bucketUrl } from '@/supabase/bucket'
import { Actions } from './actions'
import AvatarCover from './add'
import { CanType } from '@/actions/auth'
import { fallback } from '@/config/site'

type ProfileProps = {
    user: User
    can: CanType
}

const UserInfo = ({ user }: { user: User }) => (
    <div className='flex flex-col gap-1.5'>
        <h1 className='flex flex-col text-2xl leading-tight font-bold md:text-3xl'>
            <span className='flex items-center gap-2'>
                {user.name} {user.verified && <Verified />}
            </span>
            <p className='text-muted-foreground text-xs'>@{user.username}</p>
        </h1>
    </div>
)

export default function Profile({ user, can }: ProfileProps) {
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
            <div className='relative flex flex-col'>
                {/* Cover Image */}
                <div className='relative h-30 w-full overflow-hidden border-b lg:h-50'>
                    <Image
                        alt={`${user.name} cover`}
                        src={
                            user.cover
                                ? bucketUrl(user.cover) +
                                  (user.updated_at ? `?t=${user.updated_at}` : '')
                                : fallback.user + user.name + '.svg?text=' + user.name
                        }
                        fill
                        quality={100}
                        className='object-cover'
                        sizes='100vw'
                    />
                    {can.view.profile && (
                        <Button
                            isIconOnly
                            className='absolute right-3 bottom-3 z-20 bg-black/40 text-white backdrop-blur-sm hover:bg-black/60'
                            radius='full'
                            size='sm'
                            startContent={<FaCamera size={18} />}
                            onPress={handleCoverEdit}
                        />
                    )}
                    {/* Mobile Top Buttons */}
                    <div className='absolute top-0 z-10 flex w-full justify-between p-2 md:hidden'>
                        <Button
                            isIconOnly
                            passHref
                            as={Link}
                            className='bg-black/30 text-white'
                            href='/'
                            radius='full'
                            size='sm'
                            startContent={<ArrowLeft size={20} />}
                        />
                        <Button
                            isIconOnly
                            className='bg-black/30 text-white'
                            radius='full'
                            size='sm'
                            startContent={<Share size={20} />}
                            onPress={handleShare}
                        />
                    </div>
                </div>

                {/* Avatar + Actions */}
                <div className='relative z-10 -mt-16 mb-2 px-[5%] md:-mt-20 lg:px-[10%]'>
                    <div className='flex items-center justify-between gap-4'>
                        <div className='relative shrink-0'>
                            <div className='bg-default/20 dark:bg-default/40 size-28 overflow-hidden rounded-full border p-1 backdrop-blur md:size-36'>
                                <Image
                                    alt={`${user.name} avatar`}
                                    src={userAvatar(user)}
                                    fill
                                    className='rounded-full object-cover'
                                    sizes='(max-width: 768px) 112px, 144px'
                                    quality={100}
                                />
                            </div>
                            {can.view.profile && (
                                <Button
                                    isIconOnly
                                    className='absolute right-2 bottom-2 bg-black/30 text-white hover:bg-black/50'
                                    radius='full'
                                    size='sm'
                                    startContent={<Camera size={16} />}
                                    onPress={handleAvatarEdit}
                                />
                            )}
                        </div>
                        <div className='mt-16 flex w-full flex-1 justify-end md:mt-20'>
                            <div className='hidden w-full md:flex'>
                                <UserInfo user={user} />
                            </div>
                            <Actions
                                can={can}
                                isFollowing={isFollowing}
                                user={user}
                                onFollow={handleFollow}
                                onMessage={handleMessage}
                            />
                        </div>
                    </div>
                    <div className='mt-2 flex md:hidden'>
                        <UserInfo user={user} />
                    </div>
                </div>
            </div>

            {/* Avatar / Cover Editor Modal */}
            <AvatarCover
                isOpen={isOpen}
                mode={editMode}
                onClose={onClose}
                onOpenChange={onOpenChange}
            />
        </>
    )
}
