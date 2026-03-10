import { Geist, Geist_Mono, Inter } from 'next/font/google'

import { cn } from './utils'
const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

const fontInter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

export const fontVariables = cn(fontInter.variable, geistSans.variable, geistMono.variable)
