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

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        upiLink
    )}`

    const html = `
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pay via UPI</title>
</head>

<body style="font-family:sans-serif;text-align:center;padding:24px;">
    
    <h3>Opening UPI app...</h3>

    <script>
        const upiLink = "${upiLink}"
        const isWhatsApp = /WhatsApp/i.test(navigator.userAgent)
        const isMobile = /Android|iPhone/i.test(navigator.userAgent)

        if (!isWhatsApp && isMobile) {
            window.location.href = upiLink
        }

        setTimeout(() => {
            document.body.innerHTML = \`
                <h2>Complete Payment</h2>

                <p>Tap below to open your UPI app</p>

                <a href="\${upiLink}" 
                   style="display:inline-block;margin-top:10px;padding:14px 18px;background:#16a34a;color:white;border-radius:10px;text-decoration:none;font-weight:600;">
                   Pay Now
                </a>

                <p style="margin-top:18px;">Or scan QR</p>

                <img src="${qrUrl}" style="width:220px;height:220px;margin-top:10px;" />

                <p style="margin-top:18px;font-size:14px;">
                    UPI ID: <b>${pa}</b>
                </p>

                ${am ? `<p>Amount: ₹${am}</p>` : ''}

                <p style="margin-top:12px;font-size:12px;color:#666;">
                    If it doesn't open, tap ⋮ and select "Open in browser"
                </p>
            \`
        }, 1200)
    </script>

</body>
</html>
`

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html',
        },
    })
}
