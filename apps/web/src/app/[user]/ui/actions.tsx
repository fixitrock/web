'use client'

import { Button, Tooltip } from '@heroui/react'
import { Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FaWhatsapp } from 'react-icons/fa'
import { useEffect } from 'react'

import { CanType } from '@/actions/auth'
import { User } from '@/app/login/types'
import { useDevice } from '@/hooks'
import { usePwaStore } from '@/zustand/store'

interface ActionsProps {
    onFollow: () => void
    onMessage: () => void
    isFollowing: boolean
    can: CanType
    user: User
}

export function Actions({ onMessage, user, can }: ActionsProps) {
    const { installPWA, isInstallable, isStandalone, isTooltipOpen, setTooltipOpen, initialize } =
        usePwaStore()
    const { icon } = useDevice()
    const router = useRouter()

    useEffect(() => initialize(), [initialize])

    const showInstall = isInstallable && (user.role === 2 || user.role === 3) && !isStandalone

    return (
        <div className='my-auto flex w-full flex-1 items-end justify-end gap-2'>
            {showInstall ? (
                <Tooltip isOpen={isTooltipOpen} onOpenChange={setTooltipOpen}>
                    <Tooltip.Trigger>
                        <Button
                            isIconOnly
                            className='rounded-full border'
                            size='sm'
                            variant='ghost'
                            onPress={installPWA}
                        >
                            {icon}
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content placement='top' showArrow>
                        <Tooltip.Arrow />
                        <p>Tap to install our app</p>
                    </Tooltip.Content>
                </Tooltip>
            ) : null}

            {can.view.profile ? (
                <Button
                    className='w-full rounded-full'
                    size='sm'
                    variant='primary'
                    onPress={() => router.push(`/@${user.username}/settings`)}
                >
                    <Settings size={16} />
                    Edit
                </Button>
            ) : null}

            {user.showWhatsapp ? (
                <Tooltip>
                    <Tooltip.Trigger>
                        <Button
                            isIconOnly
                            className='rounded-full bg-green-500 text-white'
                            size='sm'
                            variant='primary'
                            onPress={onMessage}
                        >
                            <FaWhatsapp className='shrink-0' size={20} />
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content placement='top' showArrow>
                        <Tooltip.Arrow />
                        <p>Message on WhatsApp</p>
                    </Tooltip.Content>
                </Tooltip>
            ) : null}
        </div>
    )
}
