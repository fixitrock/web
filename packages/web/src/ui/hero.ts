import type { ClassValue } from '../utils'
import { cn } from '../utils'

export interface SharedClassNameProps {
    className?: string
}

export function mergeClassName(
    className: SharedClassNameProps['className'],
    ...inputs: ClassValue[]
) {
    return cn(...inputs, className)
}
