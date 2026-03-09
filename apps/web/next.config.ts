import type { NextConfig } from 'next'

const configuredActionOrigins = process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const serverActionAllowedOrigins = [
    'localhost:3000',
    '127.0.0.1:3000',
    '*.inc1.devtunnels.ms',
    ...(configuredActionOrigins ?? []),
]

const nextConfig: NextConfig = {
    // cacheComponents: true,
    transpilePackages: ['next-mdx-remote'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.fixitrock.com',
            },
        ],
    },
    experimental: {
        serverActions: {
            allowedOrigins: serverActionAllowedOrigins,
            bodySizeLimit: '10mb',
        },
        optimizePackageImports: [
            'lucide-react',
            'recharts',
            'framer-motion',
            'react-icons',
            '@iconify/react',
            '@heroui/react',
            'date-fns',
            'usehooks-ts',
        ],
    },
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
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
