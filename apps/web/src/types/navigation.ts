export type NavigationType = {
    id: string
    title: string
    description: string
    icon: string
    href?: string
    props?: Record<string, string | number | boolean>
    action?: 'navigate' | 'theme' | 'external'
    children?: NavigationType[]
    priority?: number
    isActive?: boolean
    search?: boolean
}
