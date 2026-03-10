import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Boxes,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  Store,
} from 'lucide-react';

const sections = [
  {
    title: 'Getting Started',
    description: 'Understand account setup, usernames, support channels, and the main route structure.',
    href: '/docs/getting-started',
    icon: BookOpen,
  },
  {
    title: 'User Guides',
    description: 'Browse Space, download tools, open FRP and iCloud sections, and follow receipts.',
    href: '/docs/user',
    icon: PackageSearch,
  },
  {
    title: 'Seller Guides',
    description: 'Set up your storefront, manage products, run POS, and track orders and activity.',
    href: '/docs/seller',
    icon: Store,
  },
];

const highlights = [
  { label: 'User flows', value: 'Downloads, tools, receipts' },
  { label: 'Seller flows', value: 'Products, POS, orders, teams' },
  { label: 'Project match', value: 'Fix iT Rock branding and route names' },
];

export default function HomePage() {
  return (
    <main className="fxr-shell">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <span className="fxr-kicker">Fix iT Rock Knowledge Base</span>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Docs for the people who <span className="fxr-gradient-text">download</span>,{' '}
                <span className="fxr-gradient-text">sell</span>, and support mobile repair work.
              </h1>
              <p className="max-w-2xl text-base text-black/65 dark:text-white/70 sm:text-lg">
                This docs app covers the real Fix iT Rock surface area: Space, FRP, iCloud,
                drivers, flashing tools, storefront setup, products, POS, orders, and daily
                seller operations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:translate-y-[-1px] dark:bg-white dark:text-black"
              >
                Open Docs
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="https://fixitrock.com"
                className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                Visit Live App
              </Link>
            </div>
            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="fxr-panel rounded-3xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-black/45 dark:text-white/45">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fxr-panel relative rounded-[2rem] p-6 sm:p-8">
            <div className="absolute right-5 top-5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-black/55 dark:text-white/55">
              Docs App
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-white p-3 shadow-sm dark:bg-black">
                <Image
                  src="/icons/fixitrock.png"
                  alt="Fix iT Rock"
                  width={72}
                  height={72}
                  priority
                  className="rounded-2xl"
                />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-black/45 dark:text-white/45">
                  Brand
                </p>
                <h2 className="text-2xl font-semibold">Fix iT Rock Docs</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl border p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5" />
                  <p className="font-medium">Built around actual product routes</p>
                </div>
                <p className="mt-2 text-sm text-black/65 dark:text-white/70">
                  `/space`, `/frp`, `/space/iCloud`, `/@username`, `/@username/products`,
                  `/@username/pos`, `/@username/orders`, and related seller sections.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border p-4">
                  <Boxes className="size-5" />
                  <p className="mt-3 font-medium">Space content</p>
                  <p className="mt-1 text-sm text-black/65 dark:text-white/70">
                    Firmware, drivers, flash tools, and specialist repair files.
                  </p>
                </div>
                <div className="rounded-3xl border p-4">
                  <ReceiptText className="size-5" />
                  <p className="mt-3 font-medium">Store operations</p>
                  <p className="mt-1 text-sm text-black/65 dark:text-white/70">
                    Catalog management, POS, orders, settings, teams, and stock.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                href={section.href}
                className="fxr-panel group rounded-[1.75rem] p-6 transition hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-5" />
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </div>
                <h2 className="mt-10 text-xl font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm text-black/65 dark:text-white/70">
                  {section.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
