'use client'
import { useState, useEffect } from 'react'

const useSlice = <T>(data: T[] | undefined, count1: number, count2: number): T[] | undefined => {
    const [itemsToShow, setItemsToShow] = useState(count2)

    useEffect(() => {
        const handleResize = () => {
            setItemsToShow(window.innerWidth >= 1536 ? count1 : count2)
        }

        handleResize()

        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [count1, count2])

    return data?.slice(0, itemsToShow)
}

export default useSlice
