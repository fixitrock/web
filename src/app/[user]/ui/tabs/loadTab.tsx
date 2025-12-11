export async function loadServerTabComponent(name: string) {
    switch (name) {
        case 'ProductCard':
            return (await import('./products')).ProductsTabs
        case 'Quotes':
            return (await import('./quotes')).Quotes
        case 'Activity':
            return (await import('./activity')).ActivityTab
        default:
            return () => (
                <div className='text-muted-foreground flex h-80 w-full flex-col items-center justify-center text-center select-none'>
                    <span className='mb-2 text-6xl'>✨</span>
                    <span className='text-2xl font-bold'>Coming Soon!</span>
                </div>
            )
    }
}
