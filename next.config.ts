import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // cacheComponents: true,
    transpilePackages: ['next-mdx-remote'],
    images: {
        qualities: [70, 75, 100],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.fixitrock.com',
            },
        ],
    },
    experimental: {
        serverActions: {
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
