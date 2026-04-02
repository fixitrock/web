'use client'

import { Button } from '@heroui/react'
import { ArrowLeft, Camera, Share } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'
import { FaCamera } from 'react-icons/fa'

import { CanType } from '@/actions/auth'
import { User } from '@/app/login/types'
import { fallback } from '@/config/site'
import { userAvatar } from '@/lib/utils'
import { bucketUrl } from '@/supabase/bucket'
import { Verified } from '@/ui/icons'

import AvatarCover from './add'
import { Actions } from './actions'

type ProfileProps = {
    user: User
    can: CanType
}

const UserInfo = ({ user }: { user: User }) => (
    <div className='flex flex-col gap-1.5'>
        <h1 className='flex flex-col text-2xl leading-tight font-bold md:text-3xl'>
            <span className='flex items-center gap-2'>
                {user.name} {user.verified ? <Verified /> : null}
            </span>
            <p className='text-muted-foreground text-xs'>@{user.username}</p>
        </h1>
    </div>
)

export default function Profile({ user, can }: ProfileProps) {
    const [isFollowing, setIsFollowing] = React.useState(false)
    const [editMode, setEditMode] = React.useState<'avatar' | 'cover'>('avatar')
    const [isEditorOpen, setIsEditorOpen] = React.useState(false)
    const router = useRouter()

    const handleFollow = () => setIsFollowing(!isFollowing)
    const handleMessage = () =>
        window.open(
            `https://api.whatsapp.com/send/?phone=${user.phone.replace(/^\+/, '')}`,
            '_blank'
        )

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: 'Check this out!',
                url: window.location.href,
            })
        }
    }

    const handleAvatarEdit = () => {
        setEditMode('avatar')
        setIsEditorOpen(true)
    }

    const handleCoverEdit = () => {
        setEditMode('cover')
        setIsEditorOpen(true)
    }

    return (
        <>
            <div className='relative flex flex-col'>
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
                        className='object-cover'
                        sizes='100vw'
                    />
                    {can.view.profile ? (
                        <Button
                            isIconOnly
                            className='absolute right-3 bottom-3 z-20 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60'
                            size='sm'
                            onPress={handleCoverEdit}
                        >
                            <FaCamera size={18} />
                        </Button>
                    ) : null}
                    <div className='absolute top-0 z-10 flex w-full justify-between p-2 md:hidden'>
                        <Button
                            isIconOnly
                            className='rounded-full bg-black/30 text-white'
                            size='sm'
                            onPress={() => router.push('/')}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <Button
                            isIconOnly
                            className='rounded-full bg-black/30 text-white'
                            size='sm'
                            onPress={handleShare}
                        >
                            <Share size={20} />
                        </Button>
                    </div>
                </div>

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
                                />
                            </div>
                            {can.view.profile ? (
                                <Button
                                    isIconOnly
                                    className='absolute right-2 bottom-2 rounded-full bg-black/30 text-white hover:bg-black/50'
                                    size='sm'
                                    onPress={handleAvatarEdit}
                                >
                                    <Camera size={16} />
                                </Button>
                            ) : null}
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

            <AvatarCover
                isOpen={isEditorOpen}
                mode={editMode}
                userUpdatedAt={user.updated_at}
                onClose={() => setIsEditorOpen(false)}
                onOpenChange={setIsEditorOpen}
            />
        </>
    )
}
