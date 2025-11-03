import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    transpilePackages: ['next-mdx-remote'],
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    async redirects() {
        return [
            {
                source: '/fw',
                destination: '/space',
                permanent: true,
            },
            {
                source: '/fw/:path*',
                destination: '/space/:path*',
                permanent: true,
            },
            {
                source: '/drive',
                destination: '/space',
                permanent: true,
            },
            {
                source: '/drive/:path*',
                destination: '/space/:path*',
                permanent: true,
            },
            {
                source: '/drive/og',
                destination: '/space/og',
                permanent: true,
            },
        ]
    },
}

export default nextConfig
