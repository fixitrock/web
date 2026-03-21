import { NextRequest, NextResponse } from 'next/server'

export function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const pa = searchParams.get('pa')
    const pn = searchParams.get('pn') || ''
    const am = searchParams.get('am') || ''

    if (!pa) {
        return new NextResponse('Invalid payment link', { status: 400 })
    }

    const upi = new URLSearchParams({
        pa,
        pn,
        cu: 'INR',
    })

    if (am) upi.append('am', am)

    const upiLink = `upi://pay?${upi.toString()}`
    const html = `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta http-equiv="refresh" content="0;url=${upiLink}" />
            </head>
            <body>
                <script>
                    window.location.replace("${upiLink}");
                </script>
                <p>If not redirected, <a href="${upiLink}">Click here</a></p>
            </body>
        </html>
    `

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
