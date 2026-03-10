// Types that match our future database structure
export type ActionType = 'navigate' | 'setTheme' | 'navigateTo' | 'href' | 'function'

export interface CommandAction {
    type: ActionType
    payload?: Record<string, unknown>
    href?: string
}

export interface DatabaseCommand {
    id: string
    category: string
    title: string
    description: string
    icon: string
    action_type: ActionType
    action_payload: Record<string, unknown> | null
    href: string | null
    children: DatabaseCommand[] | null
    order_index: number
    is_active: boolean
}

export interface ProcessedCommand {
    id: string
    title: string
    description: string
    icon: string
    action: CommandAction
    children?: ProcessedCommand[]
}

// Sample data that mimics database structure
export const sampleCommands: DatabaseCommand[] = [
    {
        id: 'theme-command',
        category: 'general',
        title: 'Change Theme . . .',
        description: 'Choose your preferred theme',
        icon: 'fa7-solid:brush',
        action_type: 'navigate',
        action_payload: null,
        href: null,
        children: [
            {
                id: 'theme-light',
                category: 'theme',
                title: 'Light',
                description: 'Change Theme to Light',
                icon: 'line-md:moon-to-sunny-outline-loop-transition',
                action_type: 'setTheme',
                action_payload: { theme: 'light' },
                href: null,
                children: null,
                order_index: 1,
                is_active: true,
            },
            {
                id: 'theme-system',
                category: 'theme',
                title: 'System',
                description: 'Change Theme to System',
                icon: 'line-md:computer',
                action_type: 'setTheme',
                action_payload: { theme: 'system' },
                href: null,
                children: null,
                order_index: 2,
                is_active: true,
            },
            {
                id: 'theme-dark',
                category: 'theme',
                title: 'Dark',
                description: 'Change Theme to Dark',
                icon: 'line-md:sunny-outline-to-moon-alt-loop-transition',
                action_type: 'setTheme',
                action_payload: { theme: 'dark' },
                href: null,
                children: null,
                order_index: 3,
                is_active: true,
            },
        ],
        order_index: 1,
        is_active: true,
    },
    {
        id: 'quick-actions',
        category: 'general',
        title: 'Quick Actions',
        description: 'Common actions and shortcuts',
        icon: 'fa7-solid:bolt',
        action_type: 'navigate',
        action_payload: null,
        href: null,
        children: [
            {
                id: 'refresh-page',
                category: 'actions',
                title: 'Refresh Page',
                description: 'Reload current page',
                icon: 'line-md:refresh',
                action_type: 'function',
                action_payload: { function: 'refresh' },
                href: null,
                children: null,
                order_index: 1,
                is_active: true,
            },
            {
                id: 'open-settings',
                category: 'actions',
                title: 'Open Settings',
                description: 'Open application settings',
                icon: 'fa7-solid:gear',
                action_type: 'href',
                action_payload: null,
                href: '/settings',
                children: null,
                order_index: 2,
                is_active: true,
            },
        ],
        order_index: 2,
        is_active: true,
    },
]

// Helper function to process database commands to our interface
export const processCommands = (dbCommands: DatabaseCommand[]): ProcessedCommand[] => {
    return dbCommands.map((cmd) => ({
        id: cmd.id,
        title: cmd.title,
        description: cmd.description,
        icon: cmd.icon,
        action: {
            type: cmd.action_type,
            payload: cmd.action_payload || undefined,
            href: cmd.href || undefined,
        },
        children: cmd.children ? processCommands(cmd.children) : undefined,
    }))
}

// Export processed commands for immediate use
export const processedCommands = processCommands(sampleCommands)

// Group commands by category for easy rendering
export const groupedCommands = processedCommands.reduce(
    (acc, cmd) => {
        const category = cmd.id.split('-')[0] || 'general'

        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(cmd)

        return acc
    },
    {} as Record<string, ProcessedCommand[]>
)

// Legacy export for backward compatibility
export const commandList = groupedCommands
