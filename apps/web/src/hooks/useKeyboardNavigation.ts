import { useEffect, useState, useRef, useCallback } from 'react'

import { useSearchStore } from '@/zustand/store'

export type KeyboardNavMode = 'list' | 'grid'

export interface UseKeyboardNavigationProps {
    length: number
    mode?: KeyboardNavMode
    minItemWidth?: number // for grid
    onSelect?: (index: number) => void
}

export function useKeyboardNavigation({
    length,
    mode = 'list',
    minItemWidth = 280,
    onSelect,
}: UseKeyboardNavigationProps) {
    const open = useSearchStore((state) => state.isOpen)
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [keyboardNav, setKeyboardNav] = useState<boolean>(false)
    const [columns, setColumns] = useState(1)
    const listRef = useRef<HTMLDivElement>(null)
    const firstItemRef = useRef<HTMLDivElement>(null)

    // Calculate columns for grid mode
    const updateColumns = useCallback(() => {
        if (mode === 'grid' && listRef.current && firstItemRef.current) {
            const containerWidth = listRef.current.offsetWidth
            const itemWidth = firstItemRef.current.offsetWidth || minItemWidth

            if (itemWidth > 0) {
                const cols = Math.max(1, Math.floor(containerWidth / itemWidth))

                setColumns(cols)
            } else {
                setColumns(1)
            }
        }
    }, [mode, minItemWidth])

    useEffect(() => {
        if (mode === 'grid') {
            updateColumns()
            window.addEventListener('resize', updateColumns)

            return () => window.removeEventListener('resize', updateColumns)
        }
    }, [updateColumns, mode, length])

    useEffect(() => {
        if (mode === 'grid') {
            setTimeout(updateColumns, 0)
        }
    }, [length, updateColumns, mode])

    // Keyboard navigation logic
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (length === 0) return
            let nextIndex = selectedIndex

            if (mode === 'grid') {
                // 2D grid navigation
                if (e.key === 'ArrowRight') {
                    e.preventDefault()
                    setKeyboardNav(true)
                    nextIndex = selectedIndex + 1
                    if (nextIndex >= length) nextIndex = length - 1
                    setSelectedIndex(nextIndex)
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault()
                    setKeyboardNav(true)
                    nextIndex = selectedIndex - 1
                    if (nextIndex < 0) nextIndex = 0
                    setSelectedIndex(nextIndex)
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setKeyboardNav(true)
                    nextIndex = selectedIndex + columns
                    if (nextIndex >= length) nextIndex = length - 1
                    setSelectedIndex(nextIndex)
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setKeyboardNav(true)
                    nextIndex = selectedIndex - columns
                    if (nextIndex < 0) nextIndex = 0
                    setSelectedIndex(nextIndex)
                } else if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault()
                    setKeyboardNav(true)
                    nextIndex = selectedIndex + 1
                    if (nextIndex >= length) nextIndex = length - 1
                    setSelectedIndex(nextIndex)
                } else if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault()
                    setKeyboardNav(true)
                    nextIndex = selectedIndex - 1
                    if (nextIndex < 0) nextIndex = 0
                    setSelectedIndex(nextIndex)
                } else if (e.key === 'Enter') {
                    if (selectedIndex >= 0 && selectedIndex < length && onSelect) {
                        e.preventDefault()
                        onSelect(selectedIndex)
                    }
                }
            } else {
                // List or 1D navigation
                if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
                    e.preventDefault()
                    setKeyboardNav(true)
                    nextIndex = selectedIndex + 1
                    if (nextIndex >= length) nextIndex = length - 1
                    setSelectedIndex(nextIndex)
                } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
                    e.preventDefault()
                    setKeyboardNav(true)
                    nextIndex = selectedIndex - 1
                    if (nextIndex < 0) nextIndex = 0
                    setSelectedIndex(nextIndex)
                } else if (e.key === 'Enter') {
                    if (selectedIndex >= 0 && selectedIndex < length && onSelect) {
                        e.preventDefault()
                        onSelect(selectedIndex)
                    }
                }
            }
        },
        [selectedIndex, length, columns, onSelect, mode]
    )

    useEffect(() => {
        if (open) return
        window.addEventListener('keydown', handleKeyDown)

        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown, open])

    // Scroll selected item into view
    useEffect(() => {
        if (!keyboardNav || selectedIndex < 0 || !listRef.current) return
        const selectedItem = listRef.current.querySelector(
            `[data-index="${selectedIndex}"]`
        ) as HTMLElement | null

        if (selectedItem) {
            selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
        setKeyboardNav(false)
    }, [selectedIndex, keyboardNav])

    // Helper for attaching refs
    function getItemRef(index: number) {
        return index === 0 ? firstItemRef : undefined
    }

    return {
        selectedIndex,
        setSelectedIndex,
        listRef,
        getItemRef,
        columns: mode === 'grid' ? columns : undefined,
    }
}
