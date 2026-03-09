// 'use client'

// import { useActionState } from 'react'
// import { useRef, useEffect } from 'react'
// import {
//     Modal,
//     ModalBody,
//     ModalContent,
//     ModalHeader,
//     Button,
//     Form,
//     ModalFooter,
//     Image,
// } from '@heroui/react'
// import { Trash2, X, Building2 } from 'lucide-react'
// import { addToast } from '@heroui/react'

// import { Brand } from '@/types/brands'
// import { bucketUrl } from '@/supabase/bucket'
// import { fallback } from '@/config/site'

// interface DeleteBrandProps {
//     isOpen: boolean
//     onClose: () => void
//     brand: Brand
// }

// export default function DeleteBrand({ isOpen, onClose, brand }: DeleteBrandProps) {
//     const [{ errors }, formAction, isLoading] = useActionState(deleteBrand, { errors: {} })
//     const formRef = useRef<HTMLFormElement>(null)

//     useEffect(() => {
//         if (errors && Object.keys(errors).length > 0) {
//             addToast({ title: errors.general || 'Please check the form fields', color: 'danger' })
//         } else if (!isLoading && errors && Object.keys(errors).length === 0) {
//             onClose()
//         }
//     }, [errors, isLoading, onClose])

//     if (!brand) return null

//     const brandDetails = [
//         { label: 'Created', value: new Date(brand.created_at).toLocaleDateString() },
//         { label: 'Updated', value: new Date(brand.updated_at).toLocaleDateString() },
//     ].filter((d) => d.value)

//     return (
//         <Modal
//             hideCloseButton
//             className='rounded-2xl border dark:bg-[#0a0a0a]'
//             isOpen={isOpen}
//             placement='center'
//             size='lg'
//             onClose={onClose}
//         >
//             <Form ref={formRef} action={formAction} id='delete-brand' validationErrors={errors}>
//                 <ModalContent>
//                     <ModalHeader className='flex-1 items-center justify-between rounded-t-2xl border-b bg-linear-to-l from-red-50/80 to-transparent select-none dark:from-red-900/30 dark:to-transparent'>
//                         <div className='flex items-center gap-2'>
//                             <Trash2 className='animate-bounce text-red-600' />
//                             <span className='text-lg font-bold'>Delete Brand</span>
//                         </div>
//                         <Button
//                             isIconOnly
//                             className='border'
//                             radius='full'
//                             size='sm'
//                             startContent={<X size={18} />}
//                             variant='light'
//                             onPress={onClose}
//                         />
//                     </ModalHeader>
//                     <ModalBody className='items-center py-6 md:flex-row'>
//                         <input name='id' type='hidden' value={brand.id.toString()} />
//                         {brand.img ? (
//                             <Image
//                                 alt={brand.name}
//                                 className='border p-2'
//                                 height={100}
//                                 src={bucketUrl(brand.img) || fallback.brand}
//                                 width={100}
//                             />
//                         ) : (
//                             <div className='text-muted-foreground flex size-28 items-center justify-center rounded-xl border bg-linear-to-br from-gray-50 to-gray-200 text-5xl shadow-inner dark:from-neutral-900 dark:to-neutral-800'>
//                                 <Building2 />
//                             </div>
//                         )}
//                         <div className='flex w-full max-w-xs flex-col gap-2'>
//                             <h1 className='line-clamp-1 text-2xl font-bold text-red-600'>
//                                 {brand.name}
//                             </h1>
//                             {brand.description && (
//                                 <p className='text-muted-foreground line-clamp-2 text-sm'>
//                                     {brand.description}
//                                 </p>
//                             )}
//                             <div className='grid grid-cols-2 gap-x-2 gap-y-1'>
//                                 {brandDetails.map((d) => (
//                                     <div key={d.label} className='text-muted-foreground text-xs'>
//                                         <span className='font-semibold'>{d.label}:</span>{' '}
//                                         <span>{d.value}</span>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </ModalBody>
//                     <ModalFooter className='flex-row-reverse gap-2 border-t bg-linear-to-r from-red-50/60 to-transparent dark:from-red-900/20 dark:to-transparent'>
//                         <Button
//                             fullWidth
//                             className='font-semibold'
//                             color='danger'
//                             isLoading={isLoading}
//                             radius='full'
//                             startContent={<Trash2 size={20} />}
//                             type='submit'
//                         >
//                             {isLoading ? 'Deleting...' : 'Yes, Delete / हाँ, डिलीट करें'}
//                         </Button>
//                         <Button
//                             className='w-full border font-medium'
//                             radius='full'
//                             type='button'
//                             variant='light'
//                             onPress={onClose}
//                         >
//                             Cancel / रद्द करें
//                         </Button>
//                     </ModalFooter>
//                 </ModalContent>
//             </Form>
//         </Modal>
//     )
// }
