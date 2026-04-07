'use client'
import { Component, ReactNode } from 'react'
import { Button } from '@heroui/react'
import { AlertCircle, Copy, Key, Shield, Wifi } from 'lucide-react'
import { toast } from 'sonner'

import { logWarning } from '@/lib/utils'

interface Props {
    children: ReactNode
}
interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error) {
        logWarning('ErrorBoundary caught an error:', error)

        const { title, description, toastType, icon } = this.getErrorInfo(error)
        const action = this.getActionButtons(error)

        toast[toastType](title, {
            description,
            icon,
            action,
            duration: toastType === 'warning' ? 5000 : 8000,
        })

        if (toastType === 'warning') {
            setTimeout(() => {
                this.setState({ hasError: false, error: undefined })
            }, 5000)
        }
    }

    getErrorInfo(error: Error) {
        const msg = error.message.toLowerCase()
        let title = 'Error'
        let description = this.getShortErrorDescription(error.message)
        let toastType: 'error' | 'warning' = 'error'
        let icon: ReactNode = <AlertCircle size={20} />

        if (msg.includes('not authenticated') || msg.includes('authentication failed')) {
            title = 'Authentication Error'
            description = 'Please log in again'
            toastType = 'warning'
            icon = <Key className='text-yellow-500' size={20} />
        } else if (msg.includes('access denied') || msg.includes('not authorized')) {
            title = 'Access Denied'
            description = "You don't have permission"
            toastType = 'warning'
            icon = <Shield className='text-yellow-500' size={20} />
        } else if (msg.includes('network') || msg.includes('fetch')) {
            title = 'Network Error'
            description = 'Check your internet connection'
            toastType = 'warning'
            icon = <Wifi className='text-blue-500' size={20} />
        } else if (msg.includes('token') || msg.includes('oauth')) {
            title = 'Auth Token Error'
            description = 'Re-authentication required'
            toastType = 'warning'
            icon = <Key className='text-yellow-500' size={20} />
        }

        return { title, description, toastType, icon }
    }

    getActionButtons(error: Error) {
        const tryAgainButton = (
            <Button
                color='primary'
                size='sm'
                variant='flat'
                onPress={() => this.setState({ hasError: false, error: undefined })}
            >
                Try Again
            </Button>
        )

        const isKnownError = error.message.match(
            /not authenticated|access denied|network|token|oauth/i
        )

        if (!isKnownError) {
            return (
                <div className='flex gap-2'>
                    {tryAgainButton}
                    <Button
                        isIconOnly
                        className='min-w-unit-8'
                        size='sm'
                        variant='light'
                        onPress={() => this.handleCopyError(error)}
                    >
                        <Copy size={16} />
                    </Button>
                </div>
            )
        }

        const needsReauth = /token|oauth|refresh token/i.test(error.message)

        return needsReauth ? (
            <div className='flex gap-2'>
                {tryAgainButton}
                <Button
                    color='warning'
                    size='sm'
                    variant='flat'
                    onPress={() => {
                        const path =
                            typeof window !== 'undefined' ? window.location.pathname : '/space'
                        window.location.href = `/oauth?return=${encodeURIComponent(path)}`
                    }}
                >
                    Re-auth OneDrive
                </Button>
            </div>
        ) : (
            tryAgainButton
        )
    }

    getShortErrorDescription(message: string): string {
        if (message.includes('map is not a function')) return 'Invalid data structure'
        if (message.includes('cannot read properties')) return 'Property access failed'
        if (message.includes('is not defined')) return 'Variable not defined'
        if (message.includes('unexpected token')) return 'Syntax error'
        if (message.includes('failed to fetch')) return 'Request failed'
        if (message.includes('timeout')) return 'Request timeout'

        return message.length > 80 ? message.substring(0, 80) + '...' : message
    }

    handleCopyError(error: Error) {
        const errorText = `${error.name}: ${error.message}\nStack: ${error.stack}`

        navigator.clipboard
            .writeText(errorText)
            .then(() => {
                toast.success('Copied!', {
                    description: 'Error details copied to clipboard',
                    icon: <Copy size={16} />,
                })
            })
            .catch(() => {
                toast.error('Copy failed', {
                    description: 'Could not copy error details',
                    icon: <AlertCircle size={16} />,
                })
            })
    }

    render() {
        return this.props.children
    }
}

interface ErrorProps {
    errors?: Record<string, { message?: string }>
    className?: string
}

export const ErrorMessage: React.FC<ErrorProps> = ({ errors, className }) => {
    if (!errors || Object.keys(errors).length === 0) return null

    return (
        <ul className={`list-inside list-disc space-y-1 text-sm text-red-600 ${className || ''}`}>
            {Object.values(errors).map((error, idx) => (
                <li key={idx}>{error?.message || 'Error'}</li>
            ))}
        </ul>
    )
}
