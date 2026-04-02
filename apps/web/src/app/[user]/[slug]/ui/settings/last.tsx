'use client'

import React, { useEffect, useState } from 'react'

import {
    AlertTriangle,
    Clock,
    Computer,
    LogOut,
    MapPin,
    Monitor,
    Shield,
    Smartphone,
    Tablet,
    Wifi,
    WifiOff,
} from 'lucide-react'
import {
    Badge,
    Button,
    Card,
    Chip,
    Modal,
    Separator,
    Spinner,
    Tooltip,
    toast,
    useOverlayState,
} from '@heroui/react'

import { deactivateSession, getUserLoginSessions, revokeAllSessions } from '@/actions/user/login'
import { formatDateTime } from '@/lib/utils'
import { UserLoginSession } from '@/types/user'

interface LoginSessionsProps {
    userId: string
}

export function LastLogin({ userId }: LoginSessionsProps) {
    const [sessions, setSessions] = useState<UserLoginSession[]>([])
    const [loading, setLoading] = useState(true)
    const [revoking, setRevoking] = useState(false)
    const overlayState = useOverlayState()

    useEffect(() => {
        void loadSessions()
    }, [userId])

    const loadSessions = async () => {
        try {
            setLoading(true)
            const data = await getUserLoginSessions(userId)
            setSessions(data)
        } catch {
            toast.danger('Failed to load login sessions')
        } finally {
            setLoading(false)
        }
    }

    const handleRevokeSession = async (sessionId: string) => {
        try {
            await deactivateSession(sessionId)
            setSessions((previous) =>
                previous.map((session) =>
                    session.session_id === sessionId ? { ...session, is_active: false } : session
                )
            )
            toast.success('Session revoked successfully')
        } catch {
            toast.danger('Failed to revoke session')
        }
    }

    const handleRevokeAllSessions = async () => {
        try {
            setRevoking(true)
            await revokeAllSessions(userId)
            setSessions((previous) => previous.map((session) => ({ ...session, is_active: false })))
            toast.success('All sessions revoked successfully')
            overlayState.close()
        } catch {
            toast.danger('Failed to revoke all sessions')
        } finally {
            setRevoking(false)
        }
    }

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case 'mobile':
                return <Smartphone className='h-4 w-4' />
            case 'tablet':
                return <Tablet className='h-4 w-4' />
            case 'desktop':
                return <Computer className='h-4 w-4' />
            default:
                return <Monitor className='h-4 w-4' />
        }
    }

    const getStatusIcon = (isActive: boolean) => {
        return isActive ? <Wifi className='h-4 w-4 text-green-500' /> : <WifiOff className='h-4 w-4 text-gray-400' />
    }

    const getLocationDisplay = (session: UserLoginSession) => {
        if (session.location_city && session.location_country) {
            return `${session.location_city}, ${session.location_country}`
        }
        if (session.location_country) {
            return session.location_country
        }

        return 'Unknown location'
    }

    const getSessionCard = (session: UserLoginSession, isCurrentSession = false) => (
        <div
            key={session.id}
            className={`flex items-center justify-between rounded-lg border p-4 ${
                isCurrentSession
                    ? 'border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20'
                    : 'bg-card'
            }`}
        >
            <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2'>
                    {getDeviceIcon(session.device_type || 'desktop')}
                    {getStatusIcon(session.is_active)}
                </div>
                <div className='flex flex-col'>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium'>{session.device_name || 'Unknown Device'}</span>
                        {isCurrentSession ? (
                            <Badge color='accent' size='sm' variant='secondary'>
                                Current
                            </Badge>
                        ) : null}
                        <Chip color='accent' size='sm' variant='soft'>
                            <Chip.Label>
                                {session.browser} {session.browser_version}
                            </Chip.Label>
                        </Chip>
                    </div>
                    <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                        <div className='flex items-center gap-1'>
                            <Monitor className='h-3 w-3' />
                            {session.os} {session.os_version}
                        </div>
                        <div className='flex items-center gap-1'>
                            <MapPin className='h-3 w-3' />
                            {getLocationDisplay(session)}
                        </div>
                        <div className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {formatDateTime(session.last_activity)}
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex items-center gap-2'>
                <Badge color={session.is_active ? 'success' : 'default'} variant='secondary'>
                    {session.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {session.is_active && !isCurrentSession ? (
                    <Tooltip>
                        <Tooltip.Trigger>
                            <Button isIconOnly size='sm' variant='danger' onPress={() => handleRevokeSession(session.session_id)}>
                                <LogOut className='h-4 w-4' />
                            </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                            <p>Revoke this session</p>
                        </Tooltip.Content>
                    </Tooltip>
                ) : null}
            </div>
        </div>
    )

    if (loading) {
        return (
            <Card className='border bg-transparent md:p-4 shadow-none'>
                <Card.Header className='items-start gap-2'>
                    <Shield className='bg-muted/20 size-8 rounded-full p-1 text-blue-500 dark:text-blue-400' />
                    <div className='flex flex-col'>
                        <h1 className='text-lg leading-5 font-semibold'>Login Sessions</h1>
                        <p className='text-muted-foreground text-sm'>Manage your active login sessions</p>
                    </div>
                </Card.Header>
                <Card.Content className='flex items-center justify-center py-8'>
                    <Spinner size='lg' />
                </Card.Content>
            </Card>
        )
    }

    const activeSessions = sessions.filter((session) => session.is_active)
    const inactiveSessions = sessions.filter((session) => !session.is_active)
    const currentSession = activeSessions.length > 0 ? activeSessions[0] : null
    const otherActiveSessions = activeSessions.slice(1)
    const recentSessions = inactiveSessions.slice(0, 5)

    return (
        <>
            <Card className='border bg-transparent md:p-4 shadow-none'>
                <Card.Header className='items-start gap-2'>
                    <Shield className='bg-muted/20 size-8 rounded-full p-1 text-blue-500 dark:text-blue-400' />
                    <div className='flex flex-col'>
                        <h1 className='text-lg leading-5 font-semibold'>Login Sessions</h1>
                        <p className='text-muted-foreground text-sm'>Manage your active login sessions</p>
                    </div>
                    {otherActiveSessions.length > 0 ? (
                        <Button size='sm' variant='danger-soft' onPress={overlayState.open}>
                            <LogOut className='mr-2 h-4 w-4' />
                            Revoke Others
                        </Button>
                    ) : null}
                </Card.Header>
                <Card.Content className='space-y-6'>
                    {currentSession ? (
                        <div>
                            <h3 className='mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200'>
                                Current Session
                            </h3>
                            {getSessionCard(currentSession, true)}
                        </div>
                    ) : null}

                    {otherActiveSessions.length > 0 ? (
                        <div>
                            <h3 className='mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200'>
                                Other Active Sessions ({otherActiveSessions.length})
                            </h3>
                            <div className='space-y-3'>{otherActiveSessions.map((session) => getSessionCard(session))}</div>
                        </div>
                    ) : null}

                    {recentSessions.length > 0 ? (
                        <div>
                            <Separator className='my-4' />
                            <h3 className='mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200'>
                                Recent Sessions ({recentSessions.length})
                            </h3>
                            <div className='space-y-2'>
                                {recentSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className='bg-muted/20 flex items-center justify-between rounded-lg border p-3'
                                    >
                                        <div className='flex items-center gap-2'>
                                            {getDeviceIcon(session.device_type || 'desktop')}
                                            <span className='text-sm'>{session.device_name || 'Unknown Device'}</span>
                                            <span className='text-muted-foreground text-xs'>
                                                - {getLocationDisplay(session)}
                                            </span>
                                        </div>
                                        <span className='text-muted-foreground text-xs'>
                                            {formatDateTime(session.last_activity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {activeSessions.length === 0 && inactiveSessions.length === 0 ? (
                        <div className='text-muted-foreground py-8 text-center'>
                            <Shield className='mx-auto mb-4 h-12 w-12 opacity-50' />
                            <p>No login sessions found</p>
                        </div>
                    ) : null}
                </Card.Content>
            </Card>

            <Modal>
                <Modal.Backdrop isOpen={overlayState.isOpen} variant='blur' onOpenChange={overlayState.setOpen}>
                    <Modal.Container size='md'>
                        <Modal.Dialog>
                            <Modal.Header>
                                <Modal.Heading>Revoke Other Sessions</Modal.Heading>
                            </Modal.Header>
                            <Modal.Body>
                                <div className='flex items-center gap-3'>
                                    <AlertTriangle className='h-6 w-6 text-amber-500' />
                                    <div>
                                        <p className='font-medium'>Are you sure?</p>
                                        <p className='text-muted-foreground text-sm'>
                                            This will log you out from all other devices. You will need to log in again on those devices.
                                        </p>
                                    </div>
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant='ghost' onPress={overlayState.close}>
                                    Cancel
                                </Button>
                                <Button isPending={revoking} variant='danger' onPress={handleRevokeAllSessions}>
                                    Revoke Other Sessions
                                </Button>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    )
}
