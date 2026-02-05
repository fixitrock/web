import { ImageResponse } from 'next/og'

import { getMeta } from '@/actions/drive'
import { siteConfig } from '@/config/site'
import { formatBytes, formatCount, formatDateTime } from '@/lib/utils'

type FontOptions = {
    name: string
    data: Buffer
    weight: 400 | 600
    style: 'normal'
}
async function loadAssets(): Promise<FontOptions[]> {
    try {
        const [{ base64Font: normal }, { base64Font: mono }, { base64Font: semibold }] =
            await Promise.all([
                import('../../../og/geist-regular-otf.json').then((mod) => mod.default || mod),
                import('../../../og/geistmono-regular-otf.json').then((mod) => mod.default || mod),
                import('../../../og/geist-semibold-otf.json').then((mod) => mod.default || mod),
            ])

        return [
            { name: 'Geist', data: Buffer.from(normal, 'base64'), weight: 400, style: 'normal' },
            { name: 'Geist Mono', data: Buffer.from(mono, 'base64'), weight: 400, style: 'normal' },
            { name: 'Geist', data: Buffer.from(semibold, 'base64'), weight: 600, style: 'normal' },
        ]
    } catch (e) {
        throw new Error(`Failed to load fonts: ${e instanceof Error ? e.message : String(e)}`)
    }
}

export const revalidate = 3600
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const data = await getMeta(slug || '')
    const [fonts] = await Promise.all([loadAssets()])

    return new ImageResponse(
        (
            <div style={{ fontFamily: 'Geist Sans' }} tw='flex h-full w-full bg-black text-white'>
                {/* <div tw='flex border absolute border-stone-700 border-dashed inset-y-0 left-16 w-px' />
                                <div tw='flex border absolute border-stone-700 border-dashed inset-y-0 right-16 w-px' />
                                <div tw='flex border absolute border-stone-700 inset-x-0 h-px top-16' />
                                <div tw='flex border absolute border-stone-700 inset-x-0 h-px bottom-16' /> */}
                <div tw='flex absolute flex-row top-24 right-24 text-white'>
                    <img
                        alt='Fix iT Rock'
                        src='https://fixitrock.com/icons/fixitrock.png'
                        style={{
                            width: '70px',
                            height: '70px',
                        }}
                    />
                </div>
                <div
                    style={{ gap: '20' }}
                    tw='flex flex-col inset-0 absolute items-center justify-center'
                >
                    {/* Render the drive-specific design */}
                    <div
                        style={{
                            width: '250px',
                            height: '250px',
                            borderRadius: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                                'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                            boxShadow:
                                '0 8px 32px rgba(0, 0, 0, 0.8), 0 -2px 8px rgba(255, 255, 255, 0.15), inset 0 0 12px rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(12px)',
                            overflow: 'hidden',
                            position: 'relative',
                            padding: 20,
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '-50%',
                                left: '-50%',
                                width: '200%',
                                height: '200%',
                                background:
                                    'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
                            }}
                        />

                        <img
                            alt={data.name}
                            src={
                                data.thumbnails?.[0]?.large?.url ||
                                `${siteConfig.domain}/icons/fallback.png`
                            }
                            style={{
                                objectFit: 'contain',
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </div>

                    <div
                        style={{
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: data.name && data.name.length > 20 ? 64 : 80,
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                    >
                        {data.name}
                    </div>

                    {/* Stats for drive */}
                    <div
                        style={{
                            gap: '30px',
                        }}
                        tw='w-[896px] flex items-center justify-center'
                    >
                        {[
                            { icon: '📁', value: formatCount(data.folder?.childCount || 0) },
                            { icon: '💾', value: formatBytes(data.size || 0) },
                            { icon: '🕒', value: formatDateTime(data.lastModifiedDateTime) },
                        ].map((stat, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background:
                                        'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                                    padding: '12px 24px',
                                    borderRadius: '30px',
                                    color: '#fff',
                                    fontSize: 24,
                                    fontWeight: 700,
                                    lineHeight: 1.4,
                                    flex: 1,
                                    minWidth: 0,
                                    whiteSpace: 'nowrap',
                                    textAlign: 'center',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    <span>{stat.icon}</span>
                                    <span>{stat.value}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 628,
            fonts,
            headers: {
                'Content-Disposition': `filename=Rock Star.webp`,
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        }
    )
}
