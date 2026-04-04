import { siteIcons } from './site.icons'
import type { SiteTheme } from './site.types'

export const siteThemes: readonly SiteTheme[] = [
    {
        title: 'Light',
        theme: 'light',
        description: 'Change theme to light',
        icon: siteIcons.light,
    },
    {
        title: 'System',
        theme: 'system',
        description: 'Change theme to system',
        icon: siteIcons.system,
    },
    {
        title: 'Dark',
        theme: 'dark',
        description: 'Change theme to dark',
        icon: siteIcons.dark,
    },
]
