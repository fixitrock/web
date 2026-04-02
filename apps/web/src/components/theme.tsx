'use client'
import { Tabs } from '@heroui/react'
import { useTheme } from 'next-themes'
import { useHotkeys } from 'react-hotkeys-hook'

import { siteConfig } from '@/config/site'
import { useMounted } from '@/hooks'

function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const { mounted } = useMounted()
    const selectedTheme = mounted ? theme : undefined

    useHotkeys('d', () => setTheme('dark'), [setTheme])
    useHotkeys('l', () => setTheme('light'), [setTheme])
    useHotkeys('s', () => setTheme('system'), [setTheme])

    return (
        <Tabs
            className='rounded-full border'
            selectedKey={selectedTheme ?? 'system'}
            variant='secondary'
            onSelectionChange={(key) => setTheme(String(key))}
        >
            <Tabs.ListContainer>
                <Tabs.List aria-label='Theme Switcher' className='bg-background gap-1 rounded-full p-1'>
                    {siteConfig.themes.map((t) => (
                        <Tabs.Tab
                            key={t.theme}
                            id={t.theme}
                            aria-label={t.description}
                            className='px-2 text-black dark:text-white'
                        >
                            <t.icon size={14} />
                            <Tabs.Indicator className='dark:bg-default/20 rounded-full border-[0.5px] shadow-none' />
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs.ListContainer>
        </Tabs>
    )
}

export default ThemeSwitcher
