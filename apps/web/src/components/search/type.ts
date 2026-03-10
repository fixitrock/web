export type Navigation = {
    id: string
    title: string
    status?: string
    description?: string
    keywords?: string[]
    shortcut?: string[]
    icon?: string
    href?: string
    action?: {
        type: 'theme' | 'section' | 'toast' | 'tab'
        value: string
    }
    children?: Navigation[]
}

export type Navigations = Navigation[]
