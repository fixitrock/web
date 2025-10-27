'use client'

import { useQuery } from '@tanstack/react-query'
import { useFilter } from '@react-aria/i18n'
import { useMemo, useState, type Key } from 'react'

const COLOR_LIST_URL = 'https://unpkg.com/color-name-list@13.1.0/dist/colornames.json'

export interface ColorItem {
    name: string
    hex: string
}

export function useColors() {
    const {
        data: colors = [],
        isLoading: colorsLoading,
        isError,
    } = useQuery<ColorItem[]>({
        queryKey: ['color-list'],
        queryFn: async () => {
            const res = await fetch(COLOR_LIST_URL)
            if (!res.ok) throw new Error('Failed to load color list')
            return res.json()
        },
        staleTime: Infinity,
        gcTime: Infinity,
    })

    const { startsWith } = useFilter({ sensitivity: 'base' })
    const [inputValue, setInputValue] = useState('')
    const [selectedKey, setSelectedKey] = useState<Key | null>(null)

    const filteredColors = useMemo(() => {
        const q = inputValue.trim().toLowerCase()
        if (!q) return colors

        const matches = colors.filter((c) => c.name.toLowerCase().includes(q))
        return matches.sort((a, b) => {
            const an = a.name.toLowerCase()
            const bn = b.name.toLowerCase()

            const aStarts = startsWith(a.name, inputValue) ? 0 : 1
            const bStarts = startsWith(b.name, inputValue) ? 0 : 1
            if (aStarts !== bStarts) return aStarts - bStarts

            const aIndex = an.indexOf(q)
            const bIndex = bn.indexOf(q)
            if (aIndex !== bIndex) return aIndex - bIndex

            return an.localeCompare(bn, 'en', { sensitivity: 'base' })
        })
    }, [colors, inputValue, startsWith])

    const onInputChange = (value: string) => {
        setInputValue(value)
    }

    const onSelectionChange = (key: Key | null) => {
        if (key === null) {
            setSelectedKey(null)
            setInputValue('')
            return
        }

        const selected = colors.find((c) => c.name === key)
        setSelectedKey(key)
        setInputValue(selected?.name || '')
    }

    return {
        colors,
        filteredColors,
        colorsLoading,
        isError,
        inputValue,
        selectedKey,
        onInputChange,
        onSelectionChange,
    }
}
