'use client'
import { Tab, Tabs } from '@heroui/react'
import { useTheme } from 'next-themes'
import { useHotkeys } from 'react-hotkeys-hook'

import { siteConfig } from '@/config/site'
import { useMounted } from '@/hooks'

function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const { mounted } = useMounted()

    useHotkeys('d', () => setTheme('dark'), [setTheme])
    useHotkeys('l', () => setTheme('light'), [setTheme])
    useHotkeys('s', () => setTheme('system'), [setTheme])

    return (
        <Tabs
        disableAnimation={!mounted}
            aria-label='Theme Switcher'
            classNames={{
                base: 'rounded-full border',
                tabContent: 'group-data-[selected=true]:text-none text-black dark:text-white',
                tabList: 'bg-background gap-1',
                tab: 'px-2',
                cursor: 'border-[0.5px] shadow-none dark:bg-default/20',
            }}
            radius='full'
            selectedKey={theme ?? undefined}
            size='sm'
            variant='light'
            onSelectionChange={(key) => setTheme(String(key))}
        >
            {siteConfig.themes.map((t) => (
                <Tab key={t.theme} aria-label={t.description} title={<t.icon size={14} />} />
            ))}
        </Tabs>
    )
}

export default ThemeSwitcher
