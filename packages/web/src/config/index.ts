export const webPackageName = '@fixitrock/web'

export const webSubpathExports = ['ui', 'hero', 'hooks', 'utils', 'types', 'config'] as const

export type WebSubpathExport = (typeof webSubpathExports)[number]

export * from './site'
export * from './site.fallback'
export * from './site.icons'
export * from './site.storage'
export * from './site.suggestions'
export * from './site.themes'
export * from './site.types'
