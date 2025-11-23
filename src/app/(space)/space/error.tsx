'use client'

import { useEffect } from 'react'
import { Button } from '@heroui/react'
import { AlertCircle, RefreshCw, Key } from 'lucide-react'

export default function SpaceError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Space page error:', error)
    }, [error])

    const isTokenError =
        error.message.includes('token') ||
        error.message.includes('oauth') ||
        error.message.includes('refresh token') ||
        error.message.includes('AADSTS')

    const handleReauth = () => {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/space'
        window.location.href = `/oauth?return=${encodeURIComponent(currentPath)}`
    }

    return (
        <div className='flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 p-8'>
            <div className='flex flex-col items-center gap-4 text-center'>
                {isTokenError ? (
                    <Key className='text-warning' size={64} strokeWidth={1.5} />
                ) : (
                    <AlertCircle className='text-danger' size={64} strokeWidth={1.5} />
                )}

                <div className='space-y-2'>
                    <h2 className='text-2xl font-bold'>
                        {isTokenError ? 'Authentication Required' : 'Something went wrong'}
                    </h2>
                    <p className='text-default-500 max-w-md'>
                        {isTokenError
                            ? 'Your OneDrive session has expired. Please re-authenticate to continue.'
                            : error.message ||
                              'An unexpected error occurred while loading your space.'}
                    </p>
                </div>

                <div className='flex gap-3'>
                    <Button
                        color='default'
                        variant='flat'
                        startContent={<RefreshCw size={18} />}
                        onPress={() => reset()}
                    >
                        Try Again
                    </Button>

                    {isTokenError && (
                        <Button
                            color='warning'
                            variant='solid'
                            startContent={<Key size={18} />}
                            onPress={handleReauth}
                        >
                            Re-authenticate OneDrive
                        </Button>
                    )}
                </div>
            </div>

            {!isTokenError && error.digest && (
                <p className='text-default-400 text-xs'>Error ID: {error.digest}</p>
            )}
        </div>
    )
}
