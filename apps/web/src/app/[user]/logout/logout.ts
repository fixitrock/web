'use client'

import { useAuth } from '@/zustand/store'

export default function Logout() {
    const { logout } = useAuth()
    logout()
    return null
}
