import { useState, useEffect } from 'react'

/**
 * Custom hook to safely parse query parameters in the browser.
 * Returns an instance of URLSearchParams.
 */
export function useSearchParams() {
    const [queryParams, setQueryParams] = useState<URLSearchParams | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setQueryParams(new URLSearchParams(window.location.search))
        }
    }, []) // Only run on mount

    return queryParams
}
