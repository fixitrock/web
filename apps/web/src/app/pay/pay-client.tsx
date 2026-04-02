'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@heroui/react'
import { Snippet } from '@heroui/snippet'

export function PayClient() {
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
        <main className='flex h-[calc(100dvh-78px)] items-center justify-center p-4'>
            <Card className='border-default-100 w-full max-w-md rounded-2xl border shadow-lg'>
                <Card.Content className='p-0'>
                    <div className='space-y-1 px-6 pt-6 pb-4 text-center'>
                        <h1 className='text-lg font-semibold'>Complete Payment</h1>
                        {pn && <p className='text-muted-foreground text-sm'>{pn}</p>}
                    </div>

                    {am && (
                        <div className='px-6 pb-4 text-center'>
                            <p className='text-foreground text-4xl font-bold tracking-tight'>
                                â‚¹{Number(am).toLocaleString('en-IN')}
                            </p>
                        </div>
                    )}

                    <div className='bg-muted/40 mx-4 space-y-3 rounded-xl p-4'>
                        <div className='space-y-1 text-center'>
                            <p className='text-muted-foreground text-xs'>UPI ID</p>
                            <Snippet size='sm' variant='flat' className='justify-center'>
                                {pa}
                            </Snippet>
                        </div>

                        <div className='text-center'>
                            <p className='text-muted-foreground text-xs'>{tn}</p>
                        </div>
                    </div>

                    <div className='px-6 pt-5'>
                        <a
                            href={upiLink}
                            className='block w-full rounded-xl bg-green-600 py-3 text-center font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]'
                        >
                            Pay Now
                        </a>
                    </div>

                    <div className='space-y-3 px-6 pt-6 pb-6 text-center'>
                        <div className='mx-auto w-fit rounded-xl border bg-white p-3 shadow-sm'>
                            <img src={qrUrl} alt='UPI QR' className='h-44 w-44 sm:h-48 sm:w-48' />
                        </div>

                        <p className='text-muted-foreground text-xs'>Scan QR with any UPI app</p>
                    </div>

                    <div className='border-t px-6 py-3 text-center'>
                        <p className='text-muted-foreground text-[11px]'>
                            If it does not open, tap menu and open in browser.
                        </p>
                    </div>
                </Card.Content>
            </Card>
        </main>
    )
}

