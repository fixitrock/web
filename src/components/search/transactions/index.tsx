'use client'

import { Balance } from './balance'

export function Transactions({ balance }: { balance: { get: number; give: number } }) {

    return (
        <div className='p-1.5 flex flex-col gap-2'>
            <Balance balance={balance} />
        </div>
    )
}
