'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader, XIcon } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import type { ReactNode } from 'react'
import { SubmitHandler, useForm, type UseFormRegisterReturn } from 'react-hook-form'
import {
    Button,
    FieldError,
    Form,
    InputGroup,
    Label,
    Modal,
    Skeleton,
    TextField,
    useOverlayState,
} from '@heroui/react'
import { User } from '@heroui/user'

import { ErrorMessage } from '@/components/error'
import { useDebounce } from '@/hooks'
import { useAddCustomer, useCustomerSearch } from '@/hooks/tanstack/query'
import { logWarning, userAvatar } from '@/lib/utils'
import { CustomerInput, CustomerSchema } from '@/types'
import { useCartStore } from '@/zustand/store'
import { usePinCodeStore } from '@/zustand/store/pincode'

type FieldInputProps = {
    label: string
    value?: string
    placeholder: string
    required?: boolean
    error?: string
    disabled?: boolean
    readOnly?: boolean
    maxLength?: number
    type?: string
    endContent?: ReactNode
    onChange?: (value: string) => void
    inputProps?: UseFormRegisterReturn
}

function FieldInput({
    label,
    value,
    placeholder,
    required = false,
    error,
    disabled = false,
    readOnly = false,
    maxLength,
    type,
    endContent,
    onChange,
    inputProps,
}: FieldInputProps) {
    return (
        <TextField isInvalid={Boolean(error)} isRequired={required}>
            <Label>{label}</Label>
            <InputGroup>
                <InputGroup.Input
                    {...inputProps}
                    disabled={disabled}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    type={type}
                    value={value}
                    onChange={(event) => onChange?.(event.target.value)}
                />
                {endContent ? <InputGroup.Suffix>{endContent}</InputGroup.Suffix> : null}
            </InputGroup>
            {error ? <FieldError>{error}</FieldError> : null}
        </TextField>
    )
}

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
    const fetchPincode = usePinCodeStore((store) => store.fetchPincode)

    const [pincode, setPincode] = useState('')
    const [city, setCity] = useState('')
    const [district, setDistrict] = useState('')
    const [state, setState] = useState('')
    const [country] = useState('India')

    useEffect(() => {
        if (phoneNumber) setValue('phone', phoneNumber)
    }, [phoneNumber, setValue])

    const handlePincodeChange = (value: string) => {
        const sanitized = value.replace(/\D/g, '').slice(0, 6)
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

    const hasPincodeData = Boolean(district && state)

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
        <Modal>
            <Modal.Backdrop isOpen={isOpen} variant='blur' onOpenChange={onOpenChange}>
                <Modal.Container
                    className='overflow-hidden rounded-2xl border bg-background'
                    scroll='inside'
                    size='lg'
                >
                    <Modal.Dialog>
                        <Form
                            onSubmit={(event) => {
                                event.preventDefault()
                                void handleSubmit(onSubmit)(event)
                            }}
                        >
                            <Modal.Header className='flex items-center border-b p-3'>
                                <Modal.Heading>Add Customer</Modal.Heading>
                                <Button
                                    isIconOnly
                                    className='ml-auto border'
                                    size='sm'
                                    variant='ghost'
                                    onPress={() => onOpenChange(false)}
                                >
                                    <XIcon className='h-4 w-4' />
                                </Button>
                            </Modal.Header>

                            <Modal.Body className='gap-4 p-3'>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FieldInput
                                        error={errors.name?.message}
                                        inputProps={register('name')}
                                        label='Name'
                                        placeholder='ex. Rock Star'
                                        required
                                    />
                                    <FieldInput
                                        error={errors.phone?.message}
                                        inputProps={register('phone')}
                                        label='Phone'
                                        maxLength={10}
                                        placeholder='9927241144'
                                        required
                                        type='tel'
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FieldInput
                                        endContent={
                                            isPendingPincode ? (
                                                <Loader className='text-muted-foreground h-4 w-4 shrink-0 animate-spin' />
                                            ) : null
                                        }
                                        label='Pincode'
                                        maxLength={6}
                                        placeholder='Enter your pincode'
                                        required
                                        type='tel'
                                        value={pincode}
                                        onChange={handlePincodeChange}
                                    />
                                    <FieldInput
                                        label='Town/City'
                                        placeholder='ex. Sikandrabad'
                                        required
                                        value={city}
                                        onChange={setCity}
                                    />
                                </div>

                                <div className='grid gap-4 md:grid-cols-2'>
                                    <FieldInput
                                        disabled={!hasPincodeData && !isPendingPincode}
                                        label='District'
                                        placeholder='District'
                                        readOnly={hasPincodeData}
                                        value={district}
                                        onChange={setDistrict}
                                    />
                                    <FieldInput
                                        disabled={!hasPincodeData && !isPendingPincode}
                                        label='State'
                                        placeholder='State'
                                        readOnly={hasPincodeData}
                                        value={state}
                                        onChange={setState}
                                    />
                                </div>

                                <ErrorMessage errors={errors} />
                            </Modal.Body>

                            <Modal.Footer className='border-t p-3'>
                                <Button fullWidth className='border' variant='ghost' onPress={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button fullWidth isPending={isPendingSubmit} type='submit' variant='primary'>
                                    Add Customer
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}

export function Customer() {
    const [open, setOpen] = useState(false)
    const overlayState = useOverlayState({})
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
            <TextField>
                <InputGroup className='bg-default/20 rounded-xl border px-1'>
                    <InputGroup.Prefix>
                        <span className='text-muted-foreground text-sm'>+91</span>
                    </InputGroup.Prefix>
                    <InputGroup.Input
                        autoComplete='on'
                        maxLength={10}
                        placeholder='Customer Phone Number'
                        type='tel'
                        value={query}
                        onChange={(event) => {
                            const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10)

                            if (!digitsOnly) clearCustomer()
                            setQuery(digitsOnly)
                        }}
                        onFocus={handleFocus}
                    />
                </InputGroup>
            </TextField>

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
                                    <Skeleton className='h-5 w-40 rounded-sm' />
                                    <Skeleton className='h-3 w-30 rounded' />
                                </div>
                            </div>
                        ) : data?.length ? (
                            data.map((user) => (
                                <User
                                    key={user.id}
                                    avatarProps={{
                                        src: userAvatar(user as any),
                                        fallback: user.name?.charAt(0) || '',
                                        className: 'size-10',
                                    }}
                                    className='focus:bg-default/25 hover:bg-default/25 flex justify-start px-2 py-1'
                                    description={user.phone.slice(2)}
                                    name={user.name}
                                    onClick={() => handleCustomerSelect(user)}
                                />
                            ))
                        ) : (
                            <User
                                avatarProps={{
                                    showFallback: true,
                                    className: 'size-10',
                                }}
                                className='focus:bg-default/25 hover:bg-default/25 flex justify-start px-2 py-1'
                                description='Click to add a new customer.'
                                name='Create New Customer'
                                onClick={() => {
                                    overlayState.open()
                                    setOpen(false)
                                }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AddCustomer
                isOpen={overlayState.isOpen}
                phoneNumber={query}
                setQuery={setQuery}
                setSelectedCustomer={setSelectedCustomer}
                onCustomerAdded={handleCustomerAdded}
                onOpenChange={overlayState.setOpen}
            />
        </div>
    )
}
