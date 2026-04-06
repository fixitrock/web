export function HeyYou(name?: string | null, previous?: string, now: Date = new Date()) {
    const hour = now.getHours()
    const firstName = name?.trim().split(/\s+/)[0]
    const safeName = firstName ? firstName.slice(0, 18) : ''
    const withName = (text: string) => (safeName ? `${text}, ${safeName}` : text)

    const morning = [
        withName('Morning'),
        withName('Naya din, naya plan'),
        withName('Chai ready, focus steady'),
        withName('Aaj kaam smooth rahe'),
        withName('Fresh start, smart moves'),
        withName('Sunrise and search time'),
        withName('Bas start karo, ho jayega'),
        withName('Good vibes, quick finds'),
        withName('Today looks promising'),
        withName('Early hustle, easy wins'),
        withName('Chalo, aaj kuch bada karte'),
        withName('Light mind, fast search'),
    ]

    const afternoon = [
        withName('Good afternoon'),
        withName('Lunch ke baad, full speed'),
        withName('Need it fast, got you'),
        withName('Quick search, less stress'),
        withName('Half day done, lets win more'),
        withName('Kaam mode on'),
        withName('Tap karo, mil jayega'),
        withName('No delay, only results'),
        withName('Steady pace, strong day'),
        withName('Afternoon flow is on'),
        withName('One search, many wins'),
        withName('Jaldi kaam, sahi kaam'),
    ]

    const evening = [
        withName('Good evening'),
        withName('Shaam ka smart sprint'),
        withName('One last push, best push'),
        withName('Wrap up like a pro'),
        withName('Calm mind, sharp results'),
        withName('Still going strong'),
        withName('Evening hustle, easy wins'),
        withName('Kaam khatam, tension kam'),
        withName('Prime time for quick search'),
        withName('Nice pace, keep rolling'),
        withName('Aaj ka score aur badhao'),
        withName('Finish strong today'),
    ]

    const night = [
        withName('Hey there'),
        withName('Night shift mode'),
        withName('Late night, light workload'),
        withName('Quiet hours, sharp search'),
        withName('Slow world, fast results'),
        withName('Raat ka focus alag hota'),
        withName('Low noise, high output'),
        withName('Final stretch, smooth finish'),
        withName('Smart work never sleeps'),
        withName('Aaj ka last win baki hai'),
        withName('Calm screen, clear results'),
        withName('Midnight momentum'),
    ]

    const pool =
        hour >= 5 && hour < 12 ? morning : hour < 18 ? afternoon : hour < 23 ? evening : night

    if (pool.length === 1) return pool[0]

    let next = pool[Math.floor(Math.random() * pool.length)]

    if (previous && pool.includes(previous) && next === previous) {
        next = pool[(pool.indexOf(previous) + 1) % pool.length]
    }

    return next
}
