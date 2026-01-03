const Fallback = () => (
    <div className='text-muted-foreground flex h-80 w-full flex-col items-center justify-center text-center select-none'>
        <span className='mb-2 text-6xl'>✨</span>
        <span className='text-2xl font-bold'>Coming Soon!</span>
    </div>
)

const TAB_COMPONENTS = {
    ProductCard: () =>
        import('./products').then((m) => m.ProductsTabs),

    Quotes: () =>
        import('./quotes').then((m) => m.Quotes),

    Activity: () =>
        import('./activity').then((m) => m.ActivityTab),
} as const

export type TabComponentName = keyof typeof TAB_COMPONENTS

export async function loadServerTabComponent(
    name: TabComponentName
) {
    return TAB_COMPONENTS[name]?.() ?? Fallback
}
