'use client'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Button,
    Form,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Skeleton,
    useDisclosure,
} from '@heroui/react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader, UserRound, XIcon } from 'lucide-react'

import { useCustomerSearch, useAddCustomer } from '@/hooks/tanstack/query'
import { useDebounce } from '@/hooks'
import { logWarning } from '@/lib/utils'
import { usePinCodeStore } from '@/zustand/store/pincode'
import { CustomerInput, CustomerSchema } from '@/types'
import { ErrorMessage } from '@/components/error'
import { useCartStore } from '@/zustand/store'

export function AddCustomer({
    isOpen,
    onOpenChange,
    phoneNumber,
    onCustomerAdded,
    setSelectedCustomer,
    setQuery,
}: {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    phoneNumber?: string
    onCustomerAdded?: (customer: CustomerInput | null) => void
    setSelectedCustomer: (customer: CustomerInput | null) => void
    setQuery: (query: string) => void
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<CustomerInput>({
        resolver: zodResolver(CustomerSchema),
        defaultValues: {
            phone: phoneNumber || '',
        },
    })

    const { mutate: addCustomer, isPending: isPendingSubmit } = useAddCustomer()
    const [isPendingPincode, startPincodeTransition] = useTransition()
    const fetchPincode = usePinCodeStore((state) => state.fetchPincode)

    const [pincode, setPincode] = useState('')
    const [city, setCity] = useState('')
    const [district, setDistrict] = useState('')
    const [state, setState] = useState('')
    const [country] = useState('India')

    useEffect(() => {
        if (phoneNumber) setValue('phone', phoneNumber)
    }, [phoneNumber, setValue])

    const handleChange = (value: string) => {
        const sanitized = value.replace(/\D/g, '')

        setPincode(sanitized)

        if (sanitized.length === 6) {
            startPincodeTransition(async () => {
                try {
                    const data = await fetchPincode(sanitized)

                    if (data) {
                        setDistrict(data.district || '')
                        setState(data.state || '')
                    } else {
                        setDistrict('')
                        setState('')
                    }
                } catch (error) {
                    logWarning('Error fetching pincode:', error)
                    setDistrict('')
                    setState('')
                }
            })
        } else {
            setDistrict('')
            setState('')
        }
    }
    const hasData = !!(district && state)
    const onSubmit: SubmitHandler<CustomerInput> = async (values) => {
        const payload: CustomerInput = {
            ...values,
            address: {
                city,
                district,
                state,
                pincode: pincode ? Number(pincode) : undefined,
                country,
            },
        }

        addCustomer(payload, {
            onSuccess: (customer) => {
                reset()
                onOpenChange(false)
                if (customer) {
                    setSelectedCustomer(customer)
                    setQuery(customer.phone)
                    onCustomerAdded?.(customer)
                }
            },
            onError: (error) => logWarning('Error adding customer:', error),
        })
    }

    return (
        <Modal
            hideCloseButton
            className='bg-background rounded-2xl border'
            isOpen={isOpen}
            scrollBehavior='inside'
            onOpenChange={onOpenChange}
        >
            <Form onSubmit={handleSubmit(onSubmit)}>
                <ModalContent>
                    <ModalHeader className='flex items-center border-b p-3'>
                        <h2 className='line-clamp-1'>Add Customer</h2>
                        <Button
                            isIconOnly
                            className='ml-auto border'
                            radius='full'
                            size='sm'
                            startContent={<XIcon className='h-4 w-4' />}
                            variant='light'
                            onPress={() => onOpenChange(false)}
                        />
                    </ModalHeader>

                    <ModalBody className='gap-4 p-3'>
                        <div className='flex items-center gap-3'>
                            <Input
                                {...register('name')}
                                isRequired
                                errorMessage={errors.name?.message}
                                isInvalid={!!errors.name}
                                label='Name'
                                labelPlacement='outside'
                                placeholder='ex. Rock Star'
                                size='sm'
                            />
                            <Input
                                {...register('phone')}
                                isRequired
                                errorMessage={errors.phone?.message}
                                isInvalid={!!errors.phone}
                                label='Phone'
                                labelPlacement='outside'
                                maxLength={10}
                                placeholder='9927241144'
                                size='sm'
                                type='tel'
                            />
                        </div>

                        <div className='flex items-center gap-3'>
                            <Input
                                isRequired
                                endContent={
                                    isPendingPincode ? (
                                        <Loader className='text-muted-foreground h-4 w-4 shrink-0 animate-spin' />
                                    ) : null
                                }
                                label='Pincode'
                                labelPlacement='outside'
                                maxLength={6}
                                placeholder='Enter your pincode'
                                size='sm'
                                type='tel'
                                value={pincode}
                                onChange={(e) => handleChange(e.target.value)}
                            />
                            <Input
                                isRequired
                                label='Town/City'
                                labelPlacement='outside'
                                placeholder='ex. Sikandrabad'
                                size='sm'
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>

                        <div className='flex items-center gap-3'>
                            <Input
                                isDisabled={!hasData && !isPendingPincode}
                                isReadOnly={hasData}
                                label='District'
                                labelPlacement='outside'
                                placeholder='District'
                                size='sm'
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                            />
                            <Input
                                isDisabled={!hasData && !isPendingPincode}
                                isReadOnly={hasData}
                                label='State'
                                labelPlacement='outside'
                                placeholder='State'
                                size='sm'
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            />
                        </div>
                        <ErrorMessage errors={errors} />
                    </ModalBody>

                    <ModalFooter className='border-t p-3'>
                        <Button
                            fullWidth
                            className='border'
                            variant='light'
                            onPress={() => onOpenChange(false)}
                        >
                            Cancel / रद्द करें
                        </Button>
                        <Button fullWidth color='primary' isLoading={isPendingSubmit} type='submit'>
                            Add Customer / ग्राहक जोड़ें
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Form>
        </Modal>
    )
}

export function Customer() {
    const [open, setOpen] = useState(false)
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [query, setQuery] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const debouncedQuery = useDebounce(query, 400)
    const shouldSearch = /^\d{10}$/.test(debouncedQuery)
    const { data, isLoading } = useCustomerSearch(shouldSearch ? debouncedQuery : '')
    const { selectedCustomer, setSelectedCustomer, clearCustomer } = useCartStore()

    useEffect(() => {
        if (!selectedCustomer) setQuery('')
    }, [selectedCustomer])
    useEffect(() => {
        setOpen(shouldSearch)
    }, [shouldSearch])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        if (open) document.addEventListener('mousedown', handleClickOutside)

        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    const handleFocus = () => {
        if (/^\d{10}$/.test(query)) {
            setOpen(true)
        }
    }

    const handleCustomerSelect = (customer: CustomerInput) => {
        setSelectedCustomer(customer)
        setQuery(customer.phone.slice(2))
        setOpen(false)
    }

    const handleCustomerAdded = (customer: CustomerInput | null) => {
        if (customer) {
            setSelectedCustomer(customer)
            setQuery(customer.phone.slice(2))
            setOpen(false)
        }
    }

    return (
        <div ref={containerRef} className='relative w-full'>
            <Input
                autoComplete='on'
                classNames={{
                    inputWrapper:
                        'bg-default/20 group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25',
                }}
                maxLength={10}
                placeholder='Customer Phone Number'
                size='sm'
                startContent={<span className='text-muted-foreground'>+91</span>}
                type='tel'
                onClear={clearCustomer}
                onFocus={handleFocus}
                onValueChange={(val) => {
                    const digitsOnly = val.replace(/\D/g, '').slice(0, 10)

                    setQuery(digitsOnly)
                }}
            />

            <AnimatePresence>
                {open && (
                    <motion.div
                        key={`popover-${query}`}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-background absolute top-full left-0 z-20 mt-1.5 w-full rounded-lg border p-1'
                        exit={{ opacity: 0, y: -4 }}
                        initial={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {isLoading ? (
                            <div key='skeleton' className='flex items-center gap-2'>
                                <Skeleton className='size-10 rounded-full' />
                                <div className='space-y-1'>
                                    <Skeleton className='size-5 w-40 rounded-sm' />
                                    <Skeleton className='size-3 w-30 rounded' />
                                </div>
                            </div>
                        ) : data?.length ? (
                            data.map((item) => (
                                <Button
                                    key={item.id}
                                    fullWidth
                                    className='group-data-[focus=true]:bg-default/25 data-[hover=true]:bg-default/25 justify-start rounded-sm'
                                    data-slot='item'
                                    startContent={
                                        <UserRound className='text-muted-foreground size-7' />
                                    }
                                    variant='light'
                                    onPress={() => handleCustomerSelect(item)}
                                >
                                    <div>
                                        <h3 className='font-medium'>{item.name}</h3>
                                        <p className='text-muted-foreground text-xs'>
                                            {item.phone.slice(2)}
                                        </p>
                                    </div>
                                </Button>
                            ))
                        ) : (
                            <div className='bg-muted/20 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-6 text-center'>
                                <div className='bg-muted/40 rounded-full p-4'>
                                    <UserRound className='text-muted-foreground size-7' />
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <p className='text-sm font-semibold tracking-tight'>
                                        No Customer Found
                                    </p>
                                    <p className='text-muted-foreground max-w-[220px] text-xs'>
                                        No customer found. Add one below to continue.
                                    </p>
                                </div>

                                <Button
                                    className='background-foreground border'
                                    size='sm'
                                    variant='light'
                                    onPress={() => {
                                        onOpen()
                                        setOpen(false)
                                    }}
                                >
                                    Add Customer
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AddCustomer
                isOpen={isOpen}
                phoneNumber={query}
                setQuery={setQuery}
                setSelectedCustomer={setSelectedCustomer}
                onCustomerAdded={handleCustomerAdded}
                onOpenChange={onOpenChange}
            />
        </div>
    )
}
