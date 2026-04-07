import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowRight,
    CircleCheckBig,
    FolderKanban,
    KeyRound,
    PackageSearch,
    ReceiptText,
    ShieldCheck,
    ShoppingBag,
} from 'lucide-react'

const sections = [
    {
        title: 'Getting Started',
        description:
            'Account flow, route patterns, support channels, and the quickest way into the platform.',
        href: '/docs/getting-started',
        icon: ShieldCheck,
    },
    {
        title: 'User Guides',
        description:
            'Space, specialist repair files, FRP routes, receipts, and public seller storefronts.',
        href: '/docs/user',
        icon: PackageSearch,
    },
    {
        title: 'Seller Guides',
        description: 'Catalog setup, POS, orders, settings, and day-to-day storefront operations.',
        href: '/docs/seller',
        icon: ShoppingBag,
    },
]

const showcase = [
    {
        title: 'Space access',
        description:
            'Move from firmware folders to driver packs and flash tools without hunting through the app.',
        icon: FolderKanban,
    },
    {
        title: 'OTP-ready flows',
        description: 'Document account access, verification, and username setup in one clear path.',
        icon: KeyRound,
    },
    {
        title: 'Seller operations',
        description:
            'Explain products, POS, orders, and receipts with routes that match the live workspace.',
        icon: ReceiptText,
    },
]

export default function HomePage() {
    return (
        <main className='fxr-shell'>
            <section className='mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-20 sm:px-8 lg:px-10 lg:py-28'>
                <div className='mx-auto flex max-w-4xl flex-col items-center gap-6 text-center'>
                    <span className='fxr-kicker'>
                        <CircleCheckBig className='size-3.5 text-(--fxr-accent-strong)' />
                        Documentation for users and sellers
                    </span>
                    <div className='space-y-5'>
                        <div className='mx-auto flex w-fit items-center gap-3 rounded-full border bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur dark:bg-white/5'>
                            <Image
                                src='/icons/fixitrock.png'
                                alt='Fix iT Rock'
                                width={26}
                                height={26}
                                className='rounded-lg'
                                priority
                            />
                            <span className='font-medium'>Fix iT Rock</span>
                            <span className='text-black/35 dark:text-white/35'>Documentation</span>
                        </div>
                        <h1 className='text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-7xl'>
                            Clear by default.
                            <br />
                            Structured for real repair work.
                        </h1>
                        <p className='mx-auto max-w-2xl text-base text-black/60 sm:text-lg dark:text-white/68'>
                            A cleaner knowledge base for Space downloads, FRP tools, storefront
                            setup, products, POS, orders, receipts, and daily seller operations
                            inside Fix iT Rock.
                        </p>
                    </div>
                    <div className='flex flex-wrap items-center justify-center gap-3'>
                        <Link
                            href='/docs'
                            className='inline-flex items-center gap-2 rounded-full bg-(--fxr-accent-strong) px-5 py-3 text-sm font-medium text-white transition hover:opacity-95'
                        >
                            Open documentation
                            <ArrowRight className='size-4' />
                        </Link>
                        <Link
                            href='https://fixitrock.com'
                            className='inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/5'
                        >
                            Open live app
                        </Link>
                    </div>
                </div>

                <div className='grid gap-4 md:grid-cols-3'>
                    {sections.map((section) => {
                        const Icon = section.icon
                        return (
                            <Link
                                key={section.title}
                                href={section.href}
                                className='fxr-panel group rounded-[1.75rem] p-6 transition hover:-translate-y-0.5'
                            >
                                <div className='flex items-center justify-between'>
                                    <Icon className='size-5' />
                                    <ArrowRight className='size-4 transition group-hover:translate-x-1' />
                                </div>
                                <h2 className='mt-10 text-xl font-semibold'>{section.title}</h2>
                                <p className='mt-2 text-sm text-black/65 dark:text-white/70'>
                                    {section.description}
                                </p>
                            </Link>
                        )
                    })}
                </div>

                <div className='grid gap-4 lg:grid-cols-3'>
                    {showcase.map((item) => {
                        const Icon = item.icon
                        return (
                            <div key={item.title} className='fxr-panel rounded-[1.6rem] p-5'>
                                <div className='flex items-center gap-3'>
                                    <div className='rounded-2xl border p-2'>
                                        <Icon className='size-5' />
                                    </div>
                                    <h2 className='font-medium'>{item.title}</h2>
                                </div>
                                <p className='mt-4 text-sm text-black/60 dark:text-white/68'>
                                    {item.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </section>
        </main>
    )
}
