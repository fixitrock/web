
import { createClient } from '@/supabase/server'
import {Balance} from './balance'

export async function Transactions() {
    const balance = await getBalance()
    return (
        <main className='w-full max-w-3xl mx-auto p-2 md:p-4'>
            <Balance balance={balance}/>
            
        </main>
    )
}

async function getBalance() {
    const supabase = await createClient()
    const { data: balance } = await supabase
    .rpc('seller_balance')
    return balance
}