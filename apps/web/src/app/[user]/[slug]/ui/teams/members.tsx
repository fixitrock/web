// 'use client'
// import { useEffect, useState } from 'react'

// import { getMembers, deleteMember } from '@/actions/teams'
// import { TeamMembers } from '@/types/teams'
// import { User } from '@/app/login/types'

// export default function Members({ user }: { user: User }) {
//     const [members, setMembers] = useState<TeamMembers>([])
//     const [loading, setLoading] = useState(true)

//     // Fetch members on mount and when params.user changes
//     useEffect(() => {
//         setLoading(true)
//         getMembers(user.id)
//             .then((data) => setMembers(data))
//             .finally(() => setLoading(false))
//     }, [user.id])

//     // Refresh members list
//     const refresh = () => {
//         setLoading(true)
//         getMembers(user.id)
//             .then((data) => setMembers(data))
//             .finally(() => setLoading(false))
//     }

//     const handleDelete = async (id: number) => {
//         await deleteMember(id)
//         refresh()
//     }

//     return (
//         <div className='space-y-4'>
//             <h2 className='text-xl font-bold'>Team Members</h2>
//             {/* <AddEditMember mode='add' onSuccess={refresh} /> */}
//             {loading ? (
//                 <div>Loading...</div>
//             ) : (
//                 <ul className='divide-y'>
//                     {members.map((member) => (
//                         <li key={member.id} className='flex items-center justify-between py-2'>
//                             <div>
//                                 <div className='font-medium'>{member.user_id}</div>
//                                 <div className='text-sm text-gray-500'>
//                                     {member.job_title || 'No title'}
//                                 </div>
//                                 <div className='text-xs text-gray-400'>Status: {member.status}</div>
//                             </div>
//                             <div className='flex gap-2'>
//                                 {/* <AddEditMember member={member} mode='edit' onSuccess={refresh} /> */}
//                                 <button
//                                     className='text-red-500 hover:underline'
//                                     onClick={() => handleDelete(member.id)}
//                                 >
//                                     Delete
//                                 </button>
//                             </div>
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     )
// }
