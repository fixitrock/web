'use client'

import { useState } from 'react'
import { Button, Input, addToast } from '@heroui/react'
import { RefreshCcw, Search } from 'lucide-react'
import { revalidateAnyUser } from '@/actions/revalidate'

export function AdminTools() {
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleRevalidate = async () => {
        if (!username) {
            addToast({ title: 'Please enter a username', color: 'warning' })
            return
        }

        setIsLoading(true)
        try {
            const result = await revalidateAnyUser(username)
            if (result.success) {
                addToast({
                    title: `Successfully revalidated @${username}`,
                    color: 'success',
                })
                setUsername('')
            }
        } catch (error: any) {
            addToast({
                title: error.message || 'Failed to revalidate',
                color: 'danger',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='space-y-4'>
                <p className='text-muted-foreground text-sm'>
                    Manually invalidate the cache for any user. This will clear their profile data,
                    stats, and orders across all servers.
                </p>
                <div className='flex flex-col items-end gap-3 md:flex-row'>
                    <Input
                        label='Username'
                        placeholder='e.g fir or @fir'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        startContent={<Search className='text-muted-foreground size-4' />}
                        className='max-w-xs'
                    />
                    <Button
                        color='primary'
                        variant='flat'
                        onPress={handleRevalidate}
                        isLoading={isLoading}
                        startContent={!isLoading && <RefreshCcw className='size-4' />}
                    >
                        Force Revalidate
                    </Button>
                </div>
            </div>
        </div>
    )
}
