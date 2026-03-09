import type { Navigation } from '../login/types'

import Link from 'next/link'
import { ArrowRight, CloudDownload, FolderSearch, Search, ShieldCheck, Wrench } from 'lucide-react'
import * as Icons from 'lucide-react'

import { userSession } from '@/actions/user'
import { siteConfig } from '@/config/site'

type Shortcut = {
    title: string
    href: string
    description?: string
    icon?: React.ComponentType<{ className?: string }>
}

const sectionPills = [
    {
        title: 'Firmware Library',
        description: 'Daily verified uploads',
        href: '#firmware',
        icon: CloudDownload,
    },
    {
        title: 'FRP Bypass',
        description: 'Trusted unlock files',
        href: '#frp',
        icon: ShieldCheck,
    },
    {
        title: 'Tools & Drivers',
        description: 'Flash tools + USB packs',
        href: '/space/Flash-Tool',
        icon: Wrench,
    },
]

export default async function Page() {
    const { user, navigation } = await userSession()
    const shortcuts = getShortcuts(navigation)
    const displayName = user?.name?.trim().split(' ')[0] || 'Rockstar'

    return (
        <main className='relative m-auto min-h-[calc(100dvh-78px)] w-full max-w-330 overflow-hidden px-4 pt-6 pb-10 sm:px-6 lg:px-8'>
            <div className='pointer-events-none absolute inset-0 -z-10'>
                <div className='absolute -top-28 left-16 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl' />
                <div className='absolute top-24 right-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl' />
                <div className='absolute bottom-14 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl' />
            </div>

            <section className='motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-3 mx-auto w-full max-w-4xl motion-safe:duration-500'>
                <form
                    action='/space'
                    className='bg-background/90 flex h-14 items-center rounded-full border px-5 shadow-[0_14px_40px_-22px_rgba(0,0,0,0.55)] backdrop-blur'
                    method='get'
                >
                    <Search className='text-muted-foreground size-5 shrink-0' />
                    <input
                        aria-label='Search firmware and tools'
                        className='placeholder:text-muted-foreground/80 text-foreground ml-3 w-full bg-transparent text-base outline-none'
                        name='q'
                        placeholder='Search firmware, FRP files, flash tools, drivers...'
                        type='search'
                    />
                    <button
                        className='bg-foreground text-background h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition-opacity hover:opacity-90'
                        type='submit'
                    >
                        Search
                    </button>
                </form>

                <div className='hide-scrollbar mt-6 flex items-start gap-3 overflow-x-auto pb-2'>
                    {shortcuts.map((shortcut) => {
                        const Icon = shortcut.icon || FolderSearch

                        return (
                            <Link
                                key={shortcut.href}
                                className='group flex min-w-23 flex-col items-center gap-2 rounded-2xl px-2 py-1 text-center'
                                href={shortcut.href}
                            >
                                <span className='bg-background/85 border-border text-muted-foreground group-hover:text-foreground flex size-14 items-center justify-center rounded-2xl border shadow-sm backdrop-blur transition-all group-hover:-translate-y-0.5 group-hover:shadow-md'>
                                    <Icon className='size-5' />
                                </span>
                                <span className='text-muted-foreground group-hover:text-foreground line-clamp-2 text-xs font-medium transition-colors'>
                                    {shortcut.title}
                                </span>
                            </Link>
                        )
                    })}
                    {/* <Link
                        aria-label='Explore all content'
                        className='group flex min-w-23 flex-col items-center gap-2 rounded-2xl px-2 py-1 text-center'
                        href='/space'
                    >
                        <span className='bg-background/85 border-border text-muted-foreground group-hover:text-foreground flex size-14 items-center justify-center rounded-2xl border shadow-sm backdrop-blur transition-all group-hover:-translate-y-0.5 group-hover:shadow-md'>
                            <Plus className='size-5' />
                        </span>
                        <span className='text-muted-foreground group-hover:text-foreground text-xs font-medium transition-colors'>
                            Explore
                        </span>
                    </Link> */}
                </div>
            </section>

            <section className='motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 mt-9 motion-safe:duration-700'>
                <h1 className='text-foreground text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl'>
                    {getGreeting()}
                    {user && (
                        <>
                            ,&nbsp;
                            <span className='bg-linear-to-r from-amber-500 via-orange-500 to-cyan-500 bg-clip-text text-transparent'>
                                {displayName}
                            </span>
                        </>
                    )}
                </h1>
                {/* <p className='text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base'>
                    Repair-ready downloads and daily resources for technicians. Jump into the most
                    used sections below.
                </p> */}

                {/* <div className='mt-5 flex flex-wrap gap-3'>
                    {sectionPills.map((pill) => {
                        const Icon = pill.icon

                        return (
                            <Link
                                key={pill.title}
                                className='bg-background/85 hover:bg-background group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-sm transition-colors'
                                href={pill.href}
                            >
                                <Icon className='text-muted-foreground group-hover:text-foreground size-4' />
                                <span className='font-semibold'>{pill.title}</span>
                                <span className='text-muted-foreground hidden text-xs sm:inline'>
                                    {pill.description}
                                </span>
                            </Link>
                        )
                    })}
                </div> */}
            </section>

            <section className='mt-7 grid gap-4 lg:grid-cols-12'>
                <article className='from-background to-muted/70 relative overflow-hidden rounded-3xl border bg-linear-to-br p-5 sm:p-6 lg:col-span-8'>
                    <div className='absolute -right-3 bottom-0 w-[42%] opacity-90'>
                        {/* <Image
                            alt='Fix iT Rock device repair'
                            className='h-auto w-full object-contain'
                            height={480}
                            priority
                            src='/repair.png'
                            width={620}
                        /> */}
                    </div>
                    <span className='bg-primary/90 text-primary-foreground inline-block rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase'>
                        Fresh and trusted files
                    </span>
                    <h2 className='mt-4 max-w-xl text-2xl font-black tracking-tight sm:text-3xl'>
                        Flash, unlock, and repair with faster access to everything you need.
                    </h2>
                    <p className='text-muted-foreground mt-3 max-w-xl text-sm sm:text-base'>
                        {siteConfig.description}
                    </p>
                    <div className='mt-5 flex flex-wrap gap-3'>
                        <Link
                            className='bg-foreground text-background inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold'
                            href='/space'
                        >
                            Open Space <ArrowRight className='size-4' />
                        </Link>
                        <Link
                            className='bg-background/90 text-foreground inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold'
                            href='/frp'
                        >
                            View FRP Bypass <ArrowRight className='size-4' />
                        </Link>
                    </div>
                </article>

                <div className='grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1'>
                    <article className='bg-background/90 rounded-3xl border p-5 backdrop-blur'>
                        <p className='text-muted-foreground text-xs tracking-wide uppercase'>
                            Quick Access
                        </p>
                        <h3 className='mt-2 text-xl font-bold'>Spare Parts Price List</h3>
                        <p className='text-muted-foreground mt-2 text-sm'>
                            Check updated parts pricing and compare before ordering.
                        </p>
                        <Link
                            className='mt-4 inline-flex items-center gap-2 text-sm font-semibold'
                            href='/scpl'
                        >
                            Open SCPL <ArrowRight className='size-4' />
                        </Link>
                    </article>

                    <article className='bg-background/90 rounded-3xl border p-5 backdrop-blur'>
                        <p className='text-muted-foreground text-xs tracking-wide uppercase'>
                            Utilities
                        </p>
                        <h3 className='mt-2 text-xl font-bold'>Drivers and Flash Tools</h3>
                        <p className='text-muted-foreground mt-2 text-sm'>
                            USB driver packs and flashing tools organized for quick setup.
                        </p>
                        <Link
                            className='mt-4 inline-flex items-center gap-2 text-sm font-semibold'
                            href='/space/Drivers'
                        >
                            Browse Drivers <ArrowRight className='size-4' />
                        </Link>
                    </article>
                </div>
            </section>
        </main>
    )
}

function getShortcuts(navigation: Navigation[]): Shortcut[] {
    const navShortcuts = navigation.map((nav) => {
        let iconComp: React.ComponentType<{ className?: string }> | undefined

        if (nav.icon && nav.icon in Icons) {
            iconComp = Icons[nav.icon as keyof typeof Icons] as React.ComponentType<{
                className?: string
            }>
        }

        return {
            href: nav.href,
            title: nav.title,
            description: nav.description,
            icon: iconComp,
        }
    })

    const suggestionShortcuts = siteConfig.suggestion
        .filter((item) => item.title !== 'Home')
        .map((item) => ({
            href: item.href,
            title: item.title,
            description: item.description,
            icon: item.icon as React.ComponentType<{ className?: string }>,
        }))

    const uniqueShortcuts = [...navShortcuts, ...suggestionShortcuts].filter(
        (item, index, list) => list.findIndex((entry) => entry.href === item.href) === index
    )

    return uniqueShortcuts.slice(0, 10)
}

function getGreeting() {
    const hour = new Date().getHours()

    if (hour >= 0 && hour < 4) return 'Good Night'
    if (hour >= 4 && hour < 12) return 'Good Morning'
    if (hour >= 12 && hour < 17) return 'Good Afternoon'
    if (hour >= 17 && hour < 21) return 'Good Evening'

    return 'Good Night'
}
