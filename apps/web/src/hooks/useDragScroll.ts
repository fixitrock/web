import { useCallback } from 'react'

export function useDragScroll<T extends HTMLElement>() {
    const setRef = useCallback((node: T | null) => {
        if (!node) return

        let isDown = false
        let startX = 0
        let scrollLeft = 0

        const handleMouseDown = (e: MouseEvent) => {
            isDown = true
            startX = e.pageX - node.offsetLeft
            scrollLeft = node.scrollLeft
            node.style.cursor = 'grabbing'
        }

        const handleMouseLeave = () => {
            isDown = false
            node.style.cursor = 'grab'
        }

        const handleMouseUp = () => {
            isDown = false
            node.style.cursor = 'grab'
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return
            e.preventDefault()
            const x = e.pageX - node.offsetLeft
            const walk = (x - startX) * 1

            node.scrollLeft = scrollLeft - walk
        }

        node.style.cursor = 'grab'
        node.addEventListener('mousedown', handleMouseDown)
        node.addEventListener('mouseleave', handleMouseLeave)
        node.addEventListener('mouseup', handleMouseUp)
        node.addEventListener('mousemove', handleMouseMove)

        return () => {
            node.removeEventListener('mousedown', handleMouseDown)
            node.removeEventListener('mouseleave', handleMouseLeave)
            node.removeEventListener('mouseup', handleMouseUp)
            node.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return setRef
}
