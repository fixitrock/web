'use client'

import React, { useState, useEffect } from 'react'
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Badge,
    Tooltip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Spinner,
    Chip,
    Divider,
} from '@heroui/react'
import {
    Monitor,
    Smartphone,
    Tablet,
    MapPin,
    Clock,
    AlertTriangle,
    LogOut,
    Shield,
    Computer,
    Wifi,
    WifiOff,
} from 'lucide-react'
import { addToast } from '@heroui/react'

import { formatDateTime } from '@/lib/utils'
import { UserLoginSession } from '@/types/user'
import { getUserLoginSessions, revokeAllSessions, deactivateSession } from '@/actions/user/login'

interface LoginSessionsProps {
    userId: string
}

export function LastLogin({ userId }: LoginSessionsProps) {
    const [sessions, setSessions] = useState<UserLoginSession[]>([])
    const [loading, setLoading] = useState(true)
    const [revoking, setRevoking] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        loadSessions()
    }, [userId])

    const loadSessions = async () => {
        try {
            setLoading(true)
            const data = await getUserLoginSessions(userId)

            setSessions(data)
        } catch {
            addToast({
                title: 'Failed to load login sessions',
                color: 'danger',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRevokeSession = async (sessionId: string) => {
        try {
            await deactivateSession(sessionId)
            setSessions((prev) =>
                prev.map((session) =>
                    session.session_id === sessionId ? { ...session, is_active: false } : session
                )
            )
            addToast({
                title: 'Session revoked successfully',
                color: 'success',
            })
        } catch {
            addToast({
                title: 'Failed to revoke session',
                color: 'danger',
            })
        }
    }

    const handleRevokeAllSessions = async () => {
        try {
            setRevoking(true)
            await revokeAllSessions(userId)
            setSessions((prev) => prev.map((session) => ({ ...session, is_active: false })))
            addToast({
                title: 'All sessions revoked successfully',
                color: 'success',
            })
            onClose()
        } catch {
            addToast({
                title: 'Failed to revoke all sessions',
                color: 'danger',
            })
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
        return isActive ? (
            <Wifi className='h-4 w-4 text-green-500' />
        ) : (
            <WifiOff className='h-4 w-4 text-gray-400' />
        )
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
                        <span className='font-medium'>
                            {session.device_name || 'Unknown Device'}
                        </span>
                        {isCurrentSession && (
                            <Badge color='primary' size='sm' variant='flat'>
                                Current
                            </Badge>
                        )}
                        <Chip color='primary' size='sm' variant='flat'>
                            {session.browser} {session.browser_version}
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
                <Badge color={session.is_active ? 'success' : 'default'} variant='flat'>
                    {session.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {session.is_active && !isCurrentSession && (
                    <Tooltip content='Revoke this session'>
                        <Button
                            isIconOnly
                            color='danger'
                            size='sm'
                            variant='light'
                            onPress={() => handleRevokeSession(session.session_id)}
                        >
                            <LogOut className='h-4 w-4' />
                        </Button>
                    </Tooltip>
                )}
            </div>
        </div>
    )

    if (loading) {
        return (
            <Card className='border bg-transparent md:p-4' shadow='none'>
                <CardHeader className='items-start gap-2'>
                    <Shield className='bg-muted/20 size-8 rounded-full p-1 text-blue-500 dark:text-blue-400' />
                    <div className='flex flex-col'>
                        <h1 className='text-lg leading-5 font-semibold'>Login Sessions</h1>
                        <p className='text-muted-foreground text-sm'>
                            Manage your active login sessions
                        </p>
                    </div>
                </CardHeader>
                <CardBody className='flex items-center justify-center py-8'>
                    <Spinner size='lg' />
                </CardBody>
            </Card>
        )
    }

    const activeSessions = sessions.filter((s) => s.is_active)
    const inactiveSessions = sessions.filter((s) => !s.is_active)

    // Get current session (most recent active session)
    const currentSession = activeSessions.length > 0 ? activeSessions[0] : null
    const otherActiveSessions = activeSessions.slice(1)
    const recentSessions = inactiveSessions.slice(0, 5)

    return (
        <>
            <Card className='border bg-transparent md:p-4' shadow='none'>
                <CardHeader className='items-start gap-2'>
                    <Shield className='bg-muted/20 size-8 rounded-full p-1 text-blue-500 dark:text-blue-400' />
                    <div className='flex flex-col'>
                        <h1 className='text-lg leading-5 font-semibold'>Login Sessions</h1>
                        <p className='text-muted-foreground text-sm'>
                            Manage your active login sessions
                        </p>
                    </div>
                    {otherActiveSessions.length > 0 && (
                        <Button
                            color='danger'
                            size='sm'
                            startContent={<LogOut className='h-4 w-4' />}
                            variant='light'
                            onPress={onOpen}
                        >
                            Revoke Others
                        </Button>
                    )}
                </CardHeader>
                <CardBody className='space-y-6'>
                    {/* Current Active Session */}
                    {currentSession && (
                        <div>
                            <h3 className='mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200'>
                                Current Session
                            </h3>
                            {getSessionCard(currentSession, true)}
                        </div>
                    )}

                    {/* Other Active Sessions */}
                    {otherActiveSessions.length > 0 && (
                        <div>
                            <h3 className='mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200'>
                                Other Active Sessions ({otherActiveSessions.length})
                            </h3>
                            <div className='space-y-3'>
                                {otherActiveSessions.map((session) => getSessionCard(session))}
                            </div>
                        </div>
                    )}

                    {/* Recent Sessions */}
                    {recentSessions.length > 0 && (
                        <div>
                            <Divider className='my-4' />
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
                                            <span className='text-sm'>
                                                {session.device_name || 'Unknown Device'}
                                            </span>
                                            <span className='text-muted-foreground text-xs'>
                                                • {getLocationDisplay(session)}
                                            </span>
                                        </div>
                                        <span className='text-muted-foreground text-xs'>
                                            {formatDateTime(session.last_activity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Sessions State */}
                    {activeSessions.length === 0 && inactiveSessions.length === 0 && (
                        <div className='text-muted-foreground py-8 text-center'>
                            <Shield className='mx-auto mb-4 h-12 w-12 opacity-50' />
                            <p>No login sessions found</p>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Revoke Other Sessions</ModalHeader>
                    <ModalBody>
                        <div className='flex items-center gap-3'>
                            <AlertTriangle className='h-6 w-6 text-amber-500' />
                            <div>
                                <p className='font-medium'>Are you sure?</p>
                                <p className='text-muted-foreground text-sm'>
                                    This will log you out from all other devices. You'll need to log
                                    in again on those devices.
                                </p>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant='light' onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color='danger'
                            isLoading={revoking}
                            onPress={handleRevokeAllSessions}
                        >
                            Revoke Other Sessions
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
