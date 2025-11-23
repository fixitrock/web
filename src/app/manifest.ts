import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Fix iT Rock',
        short_name: 'Fix iT Rock',
        description:
            'We Provide Mobile Firmwares Drivers Flash Tool FRP Dump FIle EMMC ISP PinOut Samsung MDM File Windows Files.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: "/icons/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png",

            },
            {
                src: "/icons/android-chrome-384x384.png",
                sizes: "384x384",
                type: "image/png",

            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",

            }
        ],
    }
}
