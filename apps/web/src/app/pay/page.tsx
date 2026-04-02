import { Suspense } from 'react'
import { PayClient } from './pay-client'

export const dynamic = 'force-dynamic'

export default function PayPage() {
    return (
        <Suspense fallback={null}>
            <PayClient />
        </Suspense>
    )
}
