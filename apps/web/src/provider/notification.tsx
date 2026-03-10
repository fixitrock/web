// 'use client'

// import React, { createContext, useContext, useEffect, useState } from 'react'

// import { createClient } from '@/supabase/client'
// import { Notification as NotificationType } from '@/types/users'

// import { useAuth } from './auth'

// // Context type
// type NotificationContextType = {
//     notifications: NotificationType[]
//     pendingCount: number
//     loading: boolean
// }

// const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// export function NotificationProvider({
//     children,
//     initialNotifications,
//     initialPendingCount,
// }: {
//     children: React.ReactNode
//     initialNotifications: NotificationType[]
//     initialPendingCount: number
// }) {
//     const { user } = useAuth()
//     const [notifications, setNotifications] = useState<NotificationType[]>(initialNotifications)
//     const [pendingCount, setPendingCount] = useState(initialPendingCount)
//     const [loading] = useState(false) // SSR provides initial data, so no loading flicker

//     useEffect(() => {
//         if (!user) return
//         const supabase = createClient()
//         const channel = supabase
//             .channel('notifications')
//             .on(
//                 'postgres_changes',
//                 {
//                     event: 'INSERT',
//                     schema: 'public',
//                     table: 'notifications',
//                     filter: `user_id=eq.${user.id}`,
//                 },
//                 (payload) => {
//                     setNotifications((prev) => [payload.new as NotificationType, ...prev])
//                     setPendingCount((prev) => prev + 1)
//                 }
//             )
//             .subscribe()

//         return () => {
//             supabase.removeChannel(channel)
//         }
//     }, [user])

//     return (
//         <NotificationContext.Provider value={{ notifications, pendingCount, loading }}>
//             {children}
//         </NotificationContext.Provider>
//     )
// }

// export function useNotifications() {
//     const ctx = useContext(NotificationContext)

//     if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')

//     return ctx
// }
