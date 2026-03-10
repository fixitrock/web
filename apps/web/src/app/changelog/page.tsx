import { Metadata } from 'next'

import { changelogData } from '@/config/changelog'

export const metadata: Metadata = {
    title: 'Changelog - Fix iT Rock',
    description: 'Track all changes, new features, and improvements made to Fix iT Rock',
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export default function ChangelogPage() {
    return (
        <div className=''>
            {/* Header */}
            <div className='border-border/50 border-b'>
                <div className='relative mx-auto max-w-5xl'>
                    <div className='flex items-center justify-between p-3'>
                        <h1 className='text-3xl font-semibold tracking-tight'>Changelog</h1>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className='mx-auto max-w-5xl px-6 pt-10 pb-0 lg:px-10'>
                <div className='relative'>
                    {changelogData.versions.map((version, versionIndex) =>
                        version.entries.map((entry, entryIndex) => {
                            const formattedDate = formatDate(entry.date)
                            const isFirstEntry = versionIndex === 0 && entryIndex === 0

                            return (
                                <div key={`${entry.version}-${entry.id}`} className='relative'>
                                    <div className='flex flex-col gap-y-6 md:flex-row'>
                                        <div className='flex-shrink-0 md:w-48'>
                                            <div className='pb-10 md:sticky md:top-8'>
                                                <time className='text-muted-foreground mb-3 block text-sm font-medium'>
                                                    {formattedDate}
                                                </time>

                                                {entry.version && (
                                                    <div
                                                        className={`text-foreground border-border relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold ${
                                                            isFirstEntry
                                                                ? 'border-green-600 bg-green-500 text-white shadow-lg shadow-green-500/25'
                                                                : ''
                                                        }`}
                                                    >
                                                        {entry.version}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right side - Content */}
                                        <div className='relative flex-1 pb-10 md:pl-8'>
                                            {/* Vertical timeline line */}
                                            <div className='bg-border absolute top-2 left-0 hidden h-full w-px md:block'>
                                                {/* Timeline dot */}
                                                <div
                                                    className={`absolute z-10 hidden size-3 -translate-x-1/2 rounded-full transition-all duration-500 ease-out md:block ${
                                                        isFirstEntry
                                                            ? 'animate-pulse bg-green-500 shadow-lg shadow-green-500/50'
                                                            : 'bg-primary'
                                                    }`}
                                                />
                                            </div>

                                            <div
                                                className={`space-y-6 transition-all duration-500 ease-out ${
                                                    isFirstEntry
                                                        ? 'translate-y-0 transform opacity-100'
                                                        : ''
                                                }`}
                                            >
                                                <div className='relative z-10 flex flex-col gap-2'>
                                                    <h2 className='text-2xl font-semibold tracking-tight text-balance transition-colors duration-300'>
                                                        {entry.title}
                                                    </h2>

                                                    {/* Tags */}
                                                    <div className='flex flex-wrap gap-2'>
                                                        <span className='flex h-6 w-fit items-center justify-center rounded-full border px-2 text-xs font-medium transition-all duration-300'>
                                                            {entry.type}
                                                        </span>
                                                        {entry.pullRequest && (
                                                            <span className='bg-muted text-muted-foreground flex h-6 w-fit items-center justify-center rounded-full border px-2 text-xs font-medium'>
                                                                {entry.pullRequest}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className='prose dark:prose-invert prose-headings:scroll-mt-8 prose-headings:font-semibold prose-a:no-underline prose-headings:tracking-tight prose-headings:text-balance prose-p:tracking-tight prose-p:text-balance max-w-none'>
                                                    <p className='mb-4 transition-colors duration-300'>
                                                        {entry.description}
                                                    </p>

                                                    <div className='space-y-3'>
                                                        <h4 className='text-sm font-semibold tracking-wide uppercase transition-colors duration-300'>
                                                            What's New
                                                        </h4>
                                                        <ul className='space-y-2'>
                                                            {entry.changes.map(
                                                                (change, changeIndex) => (
                                                                    <li
                                                                        key={changeIndex}
                                                                        className='text-sm leading-relaxed transition-all duration-300'
                                                                    >
                                                                        {change}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>

                                                    {/* Author info */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
