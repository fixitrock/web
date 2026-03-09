'use client'

import { useEffect, useState } from 'react'

export function useSafari() {
    // Synchronous check for SSR/first render
    let initial = false

    if (typeof navigator !== 'undefined') {
        const ua = navigator.userAgent
        const isIphone = /iPhone/i.test(ua)
        const isSafari = /^((?!chrome|android).)*safari/i.test(ua)

        initial = isIphone && isSafari
    }

    const [isIphoneSafari, setIsIphoneSafari] = useState(initial)

    useEffect(() => {
        if (typeof navigator !== 'undefined') {
            const ua = navigator.userAgent
            const isIphone = /iPhone/i.test(ua)
            const isSafari = /^((?!chrome|android).)*safari/i.test(ua)

            setIsIphoneSafari(isIphone && isSafari)
        }
    }, [])

    return isIphoneSafari
}
