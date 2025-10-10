'use client'

import * as React from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { Button } from '@/ui/button'
import { cn } from '@/lib/utils'

type Props = {
    // Controlled list of selected files (used by server actions on submit)
    files: File[]
    // Update the selected files
    setFiles: (files: File[]) => void
    // Form field name for the <input type="file" multiple>
    name: string
    // Max number of files allowed (default 5)
    maxFiles?: number
    // Helper copy shown in the dropzone
    hint?: string
}

export function ImageDropzone({
    files,
    setFiles,
    name,
    maxFiles = 5,
    hint = 'Drop files here or click to upload',
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    // Build previews using object URLs for File[]
    const previews = useMemo(
        () =>
            (files || []).map((f) => {
                try {
                    return URL.createObjectURL(f)
                } catch {
                    return ''
                }
            }),
        [files]
    )

    // Clean up object URLs
    React.useEffect(() => {
        return () => {
            previews.forEach((url) => {
                if (url) URL.revokeObjectURL(url)
            })
        }
    }, [previews])

    // Helper to sync the native file input's FileList to our controlled File[] using DataTransfer
    const syncInputFiles = useCallback((nextFiles: File[]) => {
        const input = inputRef.current

        if (!input) return
        // Some environments allow assigning a new FileList via DataTransfer
        try {
            const dt = new DataTransfer()

            nextFiles.forEach((f) => dt.items.add(f))
            input.files = dt.files
        } catch {
            // Fallback: ask user to re-pick; but we still keep controlled state
        }
    }, [])

    const applyFiles = useCallback(
        (incoming: FileList | File[] | null) => {
            if (!incoming) return
            const current = files || []
            const incomingArr = Array.from(incoming).slice(
                0,
                Math.max(0, maxFiles - current.length)
            )

            if (incomingArr.length === 0) return
            const next = [...current, ...incomingArr].slice(0, maxFiles)

            setFiles(next)
            syncInputFiles(next)
        },
        [files, maxFiles, setFiles, syncInputFiles]
    )

    function onDrop(e: React.DragEvent) {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        applyFiles(e.dataTransfer?.files || null)
    }

    function onPick(e: React.ChangeEvent<HTMLInputElement>) {
        applyFiles(e.target.files || null)
        if (e.target) e.target.value = ''
    }

    function removeAt(index: number) {
        const next = [...files]

        next.splice(index, 1)
        setFiles(next)
        syncInputFiles(next)
    }

    return (
        <div className='grid gap-2'>
            <div
                aria-label='Upload images'
                className={cn(
                    'cursor-pointer rounded-md border border-dashed p-4 text-center transition',
                    isDragging ? 'bg-muted/50' : 'bg-background'
                )}
                role='button'
                onClick={() => inputRef.current?.click()}
                onDragLeave={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                }}
                onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                }}
                onDrop={onDrop}
            >
                <p className='text-muted-foreground text-sm'>{hint}</p>
                <p className='text-muted-foreground mt-1 text-xs'>
                    {files?.length || 0}/{maxFiles} images
                </p>
                <input
                    ref={inputRef}
                    hidden
                    multiple
                    accept='image/*'
                    aria-label='Choose images'
                    name={name}
                    type='file'
                    onChange={onPick}
                />
            </div>

            {files?.length ? (
                <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5'>
                    {previews.map((url, i) => (
                        <div key={i} className='group relative'>
                            {}
                            <img
                                alt={`Uploaded preview ${i + 1}`}
                                className='h-24 w-full rounded-md border object-cover'
                                src={
                                    url ||
                                    '/placeholder.svg?height=100&width=100&query=product%20image%20preview'
                                }
                            />
                            <Button
                                aria-label={`Remove image ${i + 1}`}
                                className='absolute top-1 right-1 opacity-0 transition group-hover:opacity-100'
                                size='sm'
                                type='button'
                                variant='destructive'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeAt(i)
                                }}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}
