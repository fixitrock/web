'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardBody } from '@heroui/react'
import { Snippet } from '@heroui/snippet'

export default function PayPage() {
    const params = useSearchParams()

    const pa = params.get('pa') || ''
    const pn = params.get('pn') || ''
    const am = params.get('am') || ''
    const tn = params.get('tn') || 'Payment'

    const upi = new URLSearchParams({
        pa,
        cu: 'INR',
    })

    if (pn) upi.append('pn', pn)
    if (am) upi.append('am', am)
    if (tn) upi.append('tn', tn)

    const upiLink = `upi://pay?${upi.toString()}`

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        upiLink
    )}`

    useEffect(() => {
        const isWhatsApp = /WhatsApp/i.test(navigator.userAgent)
        const isMobile = /Android|iPhone/i.test(navigator.userAgent)

        if (!isWhatsApp && isMobile) {
            const timer = setTimeout(() => {
                window.location.href = upiLink
            }, 400)

            return () => clearTimeout(timer)
        }
    }, [upiLink])

    return (
        <main className='flex min-h-[100dvh] items-center justify-center bg-neutral-100 p-4'>
            <Card className='w-full max-w-md rounded-2xl shadow-lg'>
                <CardBody className='space-y-5 p-5 text-center sm:p-6'>
                    {/* Title */}
                    <div className='space-y-1'>
                        <h1 className='text-lg font-semibold'>Complete Payment</h1>
                        {pn && <p className='text-muted-foreground text-sm'>{pn}</p>}
                    </div>

                    {/* Amount */}
                    {am && (
                        <p className='text-foreground text-3xl font-bold'>
                            ₹{Number(am).toLocaleString('en-IN')}
                        </p>
                    )}

                    {/* UPI Snippet */}
                    <div className='space-y-1'>
                        <p className='text-muted-foreground text-xs'>UPI ID</p>
                        <Snippet size='sm' variant='flat' className='justify-center'>
                            {pa}
                        </Snippet>
                    </div>

                    {/* Note */}
                    <p className='text-muted-foreground text-xs'>{tn}</p>

                    {/* Pay Button */}
                    <a
                        href={upiLink}
                        className='block w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]'
                    >
                        Pay Now
                    </a>

                    {/* QR */}
                    <div className='flex flex-col items-center gap-2 pt-2'>
                        <img
                            src={qrUrl}
                            alt='UPI QR'
                            className='h-44 w-44 rounded-md sm:h-48 sm:w-48'
                        />
                        <p className='text-muted-foreground text-[11px]'>
                            Scan to pay via any UPI app
                        </p>
                    </div>

                    {/* Footer */}
                    <p className='text-muted-foreground text-[11px]'>
                        If it doesn’t open, tap ⋮ → Open in browser
                    </p>
                </CardBody>
            </Card>
        </main>
    )
}
