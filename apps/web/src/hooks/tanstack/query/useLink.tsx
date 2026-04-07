'use client'

import { useState, useEffect } from 'react'

import { getLink } from '@/actions/users'
import { DriveLink } from '@/types/drive'

export function useLink(id: string) {
    const [data, setData] = useState<DriveLink | null>(null)
    const [isIframeLoaded, setIsIframeLoaded] = useState(false)
    const [hasFetched, setHasFetched] = useState(false)

    useEffect(() => {
        if (!id || hasFetched) return

        setHasFetched(true)

        getLink(id)
            .then(setData)
            .catch(() => setHasFetched(false)) // Reset if fetch fails
    }, [id, hasFetched])

    return {
        data,
        isIframeLoaded,
        hiddenIframe:
            data && !isIframeLoaded ? (
                <iframe
                    className='hidden'
                    src={data.link.webUrl}
                    onLoad={() => setIsIframeLoaded(true)}
                />
            ) : null,
    }
}
