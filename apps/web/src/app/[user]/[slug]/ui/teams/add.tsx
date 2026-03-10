// 'use client'
// import { useState, useEffect } from 'react'
// import {
//     Modal,
//     ModalBody,
//     ModalContent,
//     ModalHeader,
//     ModalFooter,
//     Input,
//     Button,
//     addToast,
//     Autocomplete,
//     AutocompleteItem,
//     Select,
//     SelectItem,
// } from '@heroui/react'

// import { User } from '@/app/login/types'
// import { inviteUserToTeam, updateMember, searchUsers } from '@/actions/teams'
// import { TeamMember } from '@/types/teams'

// interface AddEditMemberProps {
//     mode: 'add' | 'edit'
//     member?: TeamMember
//     onSuccess?: () => void
// }

// export default function AddEditMember({ mode, member, onSuccess }: AddEditMemberProps) {
//     const { user: currentUser } = useAuth()
//     const [open, setOpen] = useState(false)
//     const [userQuery, setUserQuery] = useState('')
//     const [userId, setUserId] = useState('')
//     const [jobTitle, setJobTitle] = useState(member?.job_title || '')
//     const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>(
//         member?.status || 'pending'
//     )
//     const [searchResults, setSearchResults] = useState<User[]>([])
//     const [loading, setLoading] = useState(false)
//     const [selectedStatus, setSelectedStatus] = useState<Set<string>>(
//         new Set([member?.status || 'pending'])
//     )

//     // Debounced search for users
//     useEffect(() => {
//         if (mode !== 'add' || !userQuery) {
//             setSearchResults([])

//             return
//         }
//         setLoading(true)
//         const handler = setTimeout(async () => {
//             const users = await searchUsers(userQuery)

//             setSearchResults(users)
//             setLoading(false)
//         }, 400)

//         return () => clearTimeout(handler)
//     }, [userQuery, mode])

//     // Keep status in sync with selectedStatus
//     useEffect(() => {
//         if (selectedStatus.size > 0) {
//             setStatus(Array.from(selectedStatus)[0] as 'pending' | 'accepted' | 'rejected')
//         }
//     }, [selectedStatus])

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault()
//         try {
//             if (mode === 'add') {
//                 if (!userId) {
//                     addToast({ title: 'Please select a user', color: 'danger' })

//                     return
//                 }
//                 if (!currentUser) {
//                     addToast({ title: 'Not authenticated', color: 'danger' })

//                     return
//                 }
//                 await inviteUserToTeam({
//                     team_id: currentUser.id,
//                     team_username: currentUser.username,
//                     user_id: userId,
//                     job_title: jobTitle,
//                     invited_by: currentUser.id,
//                     invited_by_name: currentUser.name,
//                     invited_by_avatar: currentUser.avatar || undefined,
//                 })
//                 addToast({ title: 'Invite sent!', color: 'success' })
//             } else if (mode === 'edit' && member) {
//                 await updateMember({ id: member.id, job_title: jobTitle, status })
//                 addToast({ title: 'Member updated!', color: 'success' })
//             }
//             setOpen(false)
//             if (onSuccess) onSuccess()
//         } catch (err: unknown) {
//             const error = err as Error

//             addToast({ title: error.message || 'Error', color: 'danger' })
//         }
//     }

//     return (
//         <>
//             <Button
//                 color='primary'
//                 variant={mode === 'add' ? 'solid' : 'light'}
//                 onPress={() => setOpen(true)}
//             >
//                 {mode === 'add' ? 'Add Member' : 'Edit'}
//             </Button>
//             <Modal
//                 hideCloseButton
//                 className='rounded-xl border dark:bg-[#0a0a0a]'
//                 isOpen={open}
//                 placement='center'
//                 size='sm'
//                 onOpenChange={setOpen}
//             >
//                 <form onSubmit={handleSubmit}>
//                     <ModalContent>
//                         <ModalHeader className='flex items-center justify-between border-b bg-gray-50 dark:bg-zinc-900'>
//                             <span className='text-lg font-bold'>
//                                 {mode === 'add' ? 'Add Member' : 'Edit Member'}
//                             </span>
//                             <Button isIconOnly variant='light' onPress={() => setOpen(false)}>
//                                 ✕
//                             </Button>
//                         </ModalHeader>
//                         <ModalBody className='space-y-4'>
//                             {mode === 'add' && (
//                                 <div>
//                                     <Input
//                                         autoFocus
//                                         label='Search user by username or phone'
//                                         value={userQuery}
//                                         onChange={(e) => setUserQuery(e.target.value)}
//                                     />
//                                     <Autocomplete
//                                         className='mt-2'
//                                         inputValue={userQuery}
//                                         isLoading={loading}
//                                         label='Select User'
//                                         placeholder='Select a user'
//                                         selectedKey={userId}
//                                         onInputChange={setUserQuery}
//                                         onSelectionChange={(key) => setUserId(key as string)}
//                                     >
//                                         {searchResults.length > 0 ? (
//                                             searchResults.map((u) => (
//                                                 <AutocompleteItem key={u.id} textValue={u.username}>
//                                                     {u.username} ({u.phone})
//                                                 </AutocompleteItem>
//                                             ))
//                                         ) : userQuery && !loading ? (
//                                             <AutocompleteItem
//                                                 key='notfound'
//                                                 isDisabled
//                                                 textValue='notfound'
//                                             >
//                                                 No user found.
//                                             </AutocompleteItem>
//                                         ) : null}
//                                     </Autocomplete>
//                                 </div>
//                             )}
//                             <Input
//                                 required
//                                 label='Job Title'
//                                 placeholder='Job Title'
//                                 value={jobTitle}
//                                 onChange={(e) => setJobTitle(e.target.value)}
//                             />
//                             {mode === 'edit' && (
//                                 <Select
//                                     className='mt-2'
//                                     label='Status'
//                                     selectedKeys={selectedStatus}
//                                     onSelectionChange={(keys) =>
//                                         setSelectedStatus(new Set(Array.from(keys).map(String)))
//                                     }
//                                 >
//                                     <SelectItem key='pending'>Pending</SelectItem>
//                                     <SelectItem key='accepted'>Accepted</SelectItem>
//                                     <SelectItem key='rejected'>Rejected</SelectItem>
//                                 </Select>
//                             )}
//                         </ModalBody>
//                         <ModalFooter className='flex justify-end gap-2'>
//                             <Button variant='light' onPress={() => setOpen(false)}>
//                                 Cancel
//                             </Button>
//                             <Button color='primary' type='submit'>
//                                 {mode === 'add' ? 'Add' : 'Save'}
//                             </Button>
//                         </ModalFooter>
//                     </ModalContent>
//                 </form>
//             </Modal>
//         </>
//     )
// }
