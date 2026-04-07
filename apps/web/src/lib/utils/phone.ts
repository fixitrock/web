export function normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '')

    if (digits.length === 10) return `91${digits}`
    if (digits.length === 12 && digits.startsWith('91')) return digits

    return digits
}
