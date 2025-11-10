export function bucketUrl(src: string) {
    if (!src) return ''

    const baseUrl = process.env.R2_PUBLIC_BASE_URL || 'https://cdn.fixitrock.com'
    return baseUrl + src
}
