'use client'
import { useEffect, useState } from 'react'

type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const useScreenSize = (): ScreenSize => {
    const [screenSize, setScreenSize] = useState<ScreenSize>('xs')

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth

            if (width >= 1536) {
                setScreenSize('2xl')
            } else if (width >= 1280) {
                setScreenSize('xl')
            } else if (width >= 1024) {
                setScreenSize('lg')
            } else if (width >= 768) {
                setScreenSize('md')
            } else if (width >= 640) {
                setScreenSize('sm')
            } else {
                setScreenSize('xs')
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return screenSize
}

export default useScreenSize
