'use client'

import { useEffect, useRef } from 'react'
import { RecaptchaVerifier } from 'firebase/auth'

import { firebaseAuth } from '@/firebase/client'

// Ensure global typing
declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier
    }
}

const RECAPTCHA_ID = 'recaptcha-container'

function ensureRecaptchaContainerExists() {
    if (!document.getElementById(RECAPTCHA_ID)) {
        const container = document.createElement('div')

        container.id = RECAPTCHA_ID
        container.style.display = 'none'
        document.body.appendChild(container)
    }
}

function getRecaptchaVerifier(): RecaptchaVerifier {
    if (typeof window === 'undefined') throw new Error('Recaptcha unavailable on server')
    ensureRecaptchaContainerExists()
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, RECAPTCHA_ID, {
            size: 'normal',
            callback: () => {},
        })
    }

    return window.recaptchaVerifier
}

export function useRecaptcha() {
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

    useEffect(() => {
        // Fix pointer events for invisible recaptcha (especially on iOS)
        const fixPointerEvents = () => {
            const last = document.body.lastElementChild

            if (
                last?.tagName === 'DIV' &&
                last.querySelector?.('iframe[src*="recaptcha/api2/bframe"]')
            ) {
                const lastDiv = last as HTMLElement

                lastDiv.style.pointerEvents = 'auto'
                Array.from(lastDiv.children).forEach((child) => {
                    ;(child as HTMLElement).style.pointerEvents = 'auto'
                })
            }
        }

        const observer = new MutationObserver(fixPointerEvents)
        const interval = setInterval(fixPointerEvents, 50)

        observer.observe(document.body, { childList: true })

        // Setup recaptcha verifier
        if (typeof window !== 'undefined' && !recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = getRecaptchaVerifier()
        }

        return () => {
            observer.disconnect()
            clearInterval(interval)
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear()
                recaptchaVerifierRef.current = null
                window.recaptchaVerifier = undefined
            }
        }
    }, [])

    return recaptchaVerifierRef
}
