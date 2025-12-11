'use client'
import { Button, Tooltip } from '@heroui/react'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { FaWhatsapp } from 'react-icons/fa'

import { User } from '@/app/login/types'
import { useDevice } from '@/hooks'
import { usePwaStore } from '@/zustand/store'
import { useEffect } from 'react'
import { CanType } from '@/actions/auth'

interface ActionsProps {
    onFollow: () => void
    onMessage: () => void
    isFollowing: boolean
    can: CanType
    user: User
}

export function Actions({ onFollow, onMessage, isFollowing, user, can }: ActionsProps) {
    const { installPWA, isInstallable, isStandalone, isTooltipOpen, setTooltipOpen, initialize } =
        usePwaStore()
    const { icon } = useDevice()

    useEffect(() => {
        return initialize()
    }, [initialize])

    const showInstall = isInstallable && (user.role === 2 || user.role === 3) && !isStandalone

    return (
        <div className='my-auto flex w-full flex-1 items-end justify-end gap-2'>
            {showInstall && (
                <Tooltip
                    content='Tap to Install Our App'
                    showArrow
                    placement='top-end'
                    color='primary'
                    isOpen={isTooltipOpen}
                    onOpenChange={setTooltipOpen}
                >
                    <Button
                        isIconOnly
                        className='border'
                        radius='full'
                        size='sm'
                        startContent={icon}
                        variant='light'
                        onPress={installPWA}
                    />
                </Tooltip>
            )}

            {can.view.profile && (
                <Button
                    passHref
                    as={Link}
                    className={`w-full rounded-full`}
                    color='primary'
                    href={`@${user.username}/settings`}
                    size='sm'
                    startContent={<Settings size={16} />}
                >
                    Edit
                </Button>
            )}

            {/* {can.view.profile ? (
                <Button
                    passHref
                    as={Link}
                    className={`w-full rounded-full`}
                    color='primary'
                    href={`@${user.username}/settings`}
                    size='sm'
                    startContent={<Settings size={16} />}
                >
                    Edit
                </Button>
            ) : (
                <Button
                    fullWidth
                    className={`rounded-full ${isFollowing ? 'bg-muted/50 border-1' : 'bg-blue-500 text-white'}`}
                    size='sm'
                    startContent={isFollowing ? <Check size={18} /> : <Plus size={18} />}
                    onPress={onFollow}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </Button>
            )} */}
            <Tooltip className='bg-green-500 text-white' content='Message on WhatsApp'>
                <Button
                    isIconOnly
                    className='bg-green-500 text-white'
                    radius='full'
                    size='sm'
                    startContent={<FaWhatsapp className='shrink-0' size={20} />}
                    onPress={onMessage}
                />
            </Tooltip>
        </div>
    )
}
