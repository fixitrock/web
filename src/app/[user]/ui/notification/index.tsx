// 'use client'

// import React, { useState, useEffect } from 'react'
// import { Button, Image } from '@heroui/react'
// import { Settings } from 'lucide-react'

// import { useMediaQuery } from '@/hooks'
// import {
//     Drawer,
//     DrawerContent,
//     DrawerDescription,
//     DrawerHeader,
//     DrawerTitle,
//     DrawerTrigger,
// } from '@/ui/drawer'
// import { NotificationIcon } from '@/ui/icons'
// import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
// import { respondToTeamRequest } from '@/actions/teams'
// import { Notification as NotificationType } from '@/types/users'
// import { formatDateTime } from '@/lib/utils'
// import { useNotifications } from '@/provider/notification'

// // Define the expected shape for team_request data
// interface TeamRequestData {
//     team_id: string
//     team_username: string
//     job_title?: string
//     team_member_id: number
//     invited_by: string
//     invited_by_name: string
//     invited_by_avatar?: string
// }

// export function Notification() {
//     const [open, setOpen] = React.useState(false)
//     const isDesktop = useMediaQuery('(min-width: 786px)')
//     const { notifications: providerNotifications, pendingCount, loading } = useNotifications()
//     const [notifications, setNotifications] = useState(providerNotifications)
//     const [actionLoading, setActionLoading] = useState<number | null>(null)

//     // Keep local notifications in sync with provider
//     useEffect(() => {
//         setNotifications(providerNotifications)
//     }, [providerNotifications])

//     const handleTeamRequest = async (notif: NotificationType, status: 'accepted' | 'rejected') => {
//         const data = notif.data as unknown as TeamRequestData

//         setActionLoading(data.team_member_id)
//         await respondToTeamRequest({ team_member_id: data.team_member_id, status })
//         setActionLoading(null)
//         // Remove the notification from the UI immediately
//         setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
//     }

//     const BellWithBadge = (
//         <div className='relative'>
//             <Button
//                 isIconOnly
//                 className='border'
//                 radius='full'
//                 size='sm'
//                 startContent={<NotificationIcon className='text-muted-foreground size-5' />}
//                 variant='light'
//                 onPress={() => setOpen(true)}
//             />
//             {pendingCount > 0 && (
//                 <span className='absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white' />
//             )}
//         </div>
//     )

//     const NotificationList = (
//         <div className='flex flex-col gap-2 p-2'>
//             {loading ? (
//                 <div className='text-muted-foreground p-4 text-sm'>Loading...</div>
//             ) : notifications.length === 0 ? (
//                 <div className='text-muted-foreground p-4 text-sm'>No notifications.</div>
//             ) : (
//                 notifications.map((notif) => {
//                     if (notif.type === 'team_request') {
//                         const data = notif.data as unknown as TeamRequestData

//                         return (
//                             <div
//                                 key={notif.id}
//                                 className='bg-background/80 flex items-center gap-3 rounded-lg border p-3'
//                             >
//                                 <Image
//                                     alt={data.invited_by_name || 'User'}
//                                     className='rounded-full border object-cover'
//                                     height={40}
//                                     src={data.invited_by_avatar || '/icon.png'}
//                                     width={40}
//                                 />
//                                 <div className='flex-1'>
//                                     <div className='text-xs font-medium'>
//                                         {data.invited_by_name || 'Someone'}
//                                         <span className='text-muted-foreground ml-1'>
//                                             invited you as{' '}
//                                             <span className='text-primary font-semibold'>
//                                                 {data.job_title}
//                                             </span>
//                                         </span>
//                                     </div>
//                                     <div className='text-muted-foreground text-xs'>
//                                         {formatDateTime(notif.created_at)}
//                                     </div>
//                                 </div>
//                                 {!notif.is_read && (
//                                     <div className='flex gap-1'>
//                                         <Button
//                                             className='border'
//                                             size='sm'
//                                             variant='light'
//                                             onPress={() => handleTeamRequest(notif, 'rejected')}
//                                         >
//                                             Reject
//                                         </Button>
//                                         <Button
//                                             color='primary'
//                                             isLoading={actionLoading === data.team_member_id}
//                                             size='sm'
//                                             onPress={() => handleTeamRequest(notif, 'accepted')}
//                                         >
//                                             Accept
//                                         </Button>
//                                     </div>
//                                 )}
//                             </div>
//                         )
//                     }

//                     // Fallback for other notification types
//                     return (
//                         <div
//                             key={notif.id}
//                             className='bg-background/80 flex items-center gap-3 rounded-lg border p-3'
//                         >
//                             <Image
//                                 alt={'User'}
//                                 className='rounded-full object-cover'
//                                 height={40}
//                                 src={'/icon.png'}
//                                 width={40}
//                             />
//                             <div className='flex-1'>
//                                 <div className='font-medium'>{notif.type.replace('_', ' ')}</div>
//                                 <div className='text-muted-foreground text-xs'>
//                                     {new Date(notif.created_at).toLocaleString()}
//                                 </div>
//                             </div>
//                         </div>
//                     )
//                 })
//             )}
//         </div>
//     )

//     if (isDesktop) {
//         return (
//             <Popover open={open} onOpenChange={setOpen}>
//                 <PopoverTrigger asChild>{BellWithBadge}</PopoverTrigger>
//                 <PopoverContent
//                     align='end'
//                     className='h-fit min-h-[50dvh] w-[400px] p-0'
//                     sideOffset={10}
//                 >
//                     <div className='flex items-center justify-between border-b p-2'>
//                         <h1 className='text-large font-bold'>Notification</h1>
//                         <Button
//                             isIconOnly
//                             className='border'
//                             radius='full'
//                             size='sm'
//                             startContent={<Settings className='size-5' />}
//                             variant='light'
//                         />
//                     </div>
//                     {NotificationList}
//                 </PopoverContent>
//             </Popover>
//         )
//     }

//     return (
//         <Drawer open={open} onOpenChange={setOpen}>
//             <DrawerTrigger asChild>{BellWithBadge}</DrawerTrigger>
//             <DrawerContent className='h-[80dvh]' showbar={false}>
//                 <DrawerHeader className='flex-row items-center justify-between border-b p-2'>
//                     <DrawerTitle className='text-large font-bold'>Notification</DrawerTitle>
//                     <DrawerDescription>
//                         <Button
//                             isIconOnly
//                             className='border'
//                             radius='full'
//                             size='sm'
//                             startContent={<Settings className='size-5' />}
//                             variant='light'
//                         />
//                     </DrawerDescription>
//                 </DrawerHeader>
//                 {NotificationList}
//             </DrawerContent>
//         </Drawer>
//     )
// }
