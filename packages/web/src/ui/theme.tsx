'use client'

import { Tabs } from '@heroui/react'
import { useTheme } from 'next-themes'
import { useHotkeys } from 'react-hotkeys-hook'

import { siteConfig } from '../config'
import { useMounted } from '../hooks'

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const { mounted } = useMounted()
    const selectedTheme = mounted ? theme : undefined

    useHotkeys('d', () => setTheme('dark'), [setTheme])
    useHotkeys('l', () => setTheme('light'), [setTheme])
    useHotkeys('s', () => setTheme('system'), [setTheme])

    return (
        <Tabs selectedKey={selectedTheme} onSelectionChange={(key) => setTheme(String(key))}>
            <Tabs.ListContainer>
                <Tabs.List
                    aria-label='Theme Switcher'
                    className='flex items-center gap-1 rounded-full'
                >
                    {siteConfig.themes.map((t) => (
                        <Tabs.Tab
                            key={t.theme}
                            id={t.theme}
                            className='relative flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors dark:text-white'
                        >
                            <span className='relative z-10 flex items-center justify-center'>
                                <t.icon size={14} />
                            </span>
                            <Tabs.Indicator className='bg-default/70 dark:bg-default/20 rounded-full border border-black/10 shadow-none dark:border-white/10' />
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs.ListContainer>

            {siteConfig.themes.map((t) => (
                <Tabs.Panel key={t.theme} id={t.theme} className='sr-only'>
                    {t.description}
                </Tabs.Panel>
            ))}
        </Tabs>
    )
}
