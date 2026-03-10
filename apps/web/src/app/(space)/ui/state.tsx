'use client'

import { Button } from '@heroui/react'
import { AlertCircle, RefreshCw, FolderOpen, FileText, Search } from 'lucide-react'

interface ErrorStateProps {
    title?: string
    message?: string
    onRetry?: () => void
    onRefresh?: () => void
}
interface EmptyStateProps {
    type: 'empty' | 'notFound' | 'noResults'
    title?: string
    description?: string
    action?: {
        label: string
        onPress: () => void
    }
}

export function ErrorState({
    title = 'Something went wrong',
    message = 'An error occurred while loading the folder contents. Please try again.',
    onRetry,
    onRefresh,
}: ErrorStateProps) {
    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh()
        } else {
            window.location.reload()
        }
    }

    return (
        <div className='flex flex-col items-center justify-center px-4 py-16 text-center'>
            <div className='mb-6 flex justify-center'>
                <div className='bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-full'>
                    <AlertCircle className='text-destructive h-8 w-8' />
                </div>
            </div>

            <h3 className='text-foreground mb-3 text-xl font-semibold'>{title}</h3>

            <p className='text-muted-foreground mb-6 max-w-md'>{message}</p>

            <div className='flex gap-3'>
                {onRetry && (
                    <button
                        className='bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
                        onClick={onRetry}
                    >
                        Try Again
                    </button>
                )}

                <button
                    className='border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50'
                    onClick={handleRefresh}
                >
                    <RefreshCw className='h-4 w-4' />
                    Refresh Page
                </button>
            </div>
        </div>
    )
}

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
    const getContent = () => {
        switch (type) {
            case 'empty':
                return {
                    icon: <FolderOpen className='text-muted-foreground/60 h-16 w-16' />,
                    title: title || 'Empty Folder',
                    description:
                        description ||
                        'This folder is empty. Upload files or create subfolders to get started.',
                }
            case 'notFound':
                return {
                    icon: <Search className='text-muted-foreground/60 h-16 w-16' />,
                    title: title || 'Folder Not Found',
                    description:
                        description ||
                        'The requested folder could not be found or you may not have access to it.',
                }
            case 'noResults':
                return {
                    icon: <FileText className='text-muted-foreground/60 h-16 w-16' />,
                    title: title || 'No Results Found',
                    description:
                        description ||
                        'No items match your search criteria. Try adjusting your search terms.',
                }
            default:
                return {
                    icon: <FolderOpen className='text-muted-foreground/60 h-16 w-16' />,
                    title: 'No Items',
                    description: 'There are no items to display.',
                }
        }
    }

    const content = getContent()

    return (
        <div className='flex flex-col items-center justify-center px-4 py-16 text-center'>
            <div className='mb-6 flex justify-center'>{content.icon}</div>

            <h3 className='text-foreground mb-3 text-xl font-semibold'>{content.title}</h3>

            <p className='text-muted-foreground mb-6 max-w-md'>{content.description}</p>

            {action && <Button onPress={action.onPress}>{action.label}</Button>}
        </div>
    )
}
