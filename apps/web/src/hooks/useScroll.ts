'use client'
import { useState, useEffect } from 'react'

const useScroll = () => {
    const [lastScrollY, setLastScrollY] = useState(0)
    const [direction, setDirection] = useState<'up' | 'down'>('up')

    useEffect(() => {
        const listener = () => {
            setDirection(window.scrollY > lastScrollY ? 'down' : 'up')
            setLastScrollY(window.scrollY)
        }

        window.addEventListener('scroll', listener)

        return () => {
            window.removeEventListener('scroll', listener)
        }
    }, [lastScrollY])

    return { scrollY: lastScrollY, direction }
}

export default useScroll
