'use client'

import { Button } from '@heroui/react'

import { Delete } from '@/ui/icons'

interface DownloadHeaderProps {
    completedCount: number
    onClearCompleted: () => void
}

export function DownloadHeader({ completedCount, onClearCompleted }: DownloadHeaderProps) {
    return (
        <div className='border-b p-2 pt-0 select-none md:p-3'>
            <div className='flex items-center justify-between'>
                <h3 className='text-md font-bold'>Downloads</h3>
                {completedCount > 0 && (
                    <Button
                        isIconOnly
                        color='danger'
                        size='sm'
                        startContent={<Delete className='size-5' />}
                        title='Clear completed downloads'
                        variant='light'
                        onPress={onClearCompleted}
                    />
                )}
            </div>
        </div>
    )
}
