'use client'

import {
    Button,
    Description,
    FieldError,
    Form,
    InputGroup,
    Label,
    Radio,
    RadioGroup,
    TextField,
} from '@heroui/react'
import { AtSign, Check, Loader, UserRound, X } from 'lucide-react'
import { type ReactNode, useEffect, useState, useTransition } from 'react'

import { checkUsername, createUser } from '@/actions/user'
import { User } from '@/app/login/types'
import { useDebounce } from '@/hooks/useDebounce'
import { Dob } from '@/ui/dob'
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/drawer'
import { usePinCodeStore } from '@/zustand/store/pincode'

interface StepDetailsProps {
    user: Partial<User>
    setUser: (val: Partial<User>) => void
    loading: boolean
    setLoading: (val: boolean) => void
    setError: (val: string) => void
}

const USERNAME_REGEX = /^[a-z0-9_]+$/
const MIN_LENGTH = 3
const MAX_LENGTH = 15

type FieldInputProps = {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    required?: boolean
    invalid?: boolean
    error?: string
    description?: string
    prefix?: ReactNode
    suffix?: ReactNode
    maxLength?: number
    autoFocus?: boolean
}

function FieldInput({
    label,
    value,
    onChange,
    placeholder,
    required = false,
    invalid = false,
    error,
    description,
    prefix,
    suffix,
    maxLength,
    autoFocus = false,
}: FieldInputProps) {
    return (
        <TextField isInvalid={invalid} isRequired={required}>
            <Label>{label}</Label>
            <InputGroup>
                {prefix ? <InputGroup.Prefix>{prefix}</InputGroup.Prefix> : null}
                <InputGroup.Input
                    autoFocus={autoFocus}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
                {suffix ? <InputGroup.Suffix>{suffix}</InputGroup.Suffix> : null}
            </InputGroup>
            {description ? <Description>{description}</Description> : null}
            {error ? <FieldError>{error}</FieldError> : null}
        </TextField>
    )
}

export function StepDetails({ user, setUser, loading, setLoading, setError }: StepDetailsProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const username = user.username ?? ''
    const name = user.name ?? ''
    const gender = user.gender
    const debouncedUsername = useDebounce(username, 400)
    const [checkingUsername, setCheckingUsername] = useState(false)
    const [usernameChecked, setUsernameChecked] = useState(false)
    const [isUsernameUnique, setIsUsernameUnique] = useState<boolean | null>(null)
    const [dob, setDob] = useState('')
    const [dobError, setDobError] = useState('')

    const fetchPincode = usePinCodeStore((store) => store.fetchPincode)
    const [isPendingPincode, startPincodeTransition] = useTransition()
    const [pincode, setPincode] = useState('')
    const [city, setCity] = useState('')
    const [district, setDistrict] = useState('')
    const [state, setState] = useState('')
    const [country] = useState('India')

    const isValidFormat = USERNAME_REGEX.test(username)
    const isValidLength = username.length >= MIN_LENGTH && username.length <= MAX_LENGTH
    const showUsernameError = hasSubmitted || username.length > 0
    const showNameError = hasSubmitted || name.length > 0
    const usernameError = !showUsernameError
        ? undefined
        : !username
          ? 'Username is required'
          : !isValidFormat
            ? 'Only lowercase letters, numbers, and underscores allowed'
            : !isValidLength
              ? `Must be at least ${MIN_LENGTH} characters`
              : isUsernameUnique === false
                ? 'This username is already taken'
                : undefined

    useEffect(() => {
        if (!debouncedUsername || !isValidFormat || !isValidLength) {
            setUsernameChecked(false)
            setIsUsernameUnique(null)

            return
        }

        setCheckingUsername(true)
        checkUsername(debouncedUsername).then((res) => {
            setIsUsernameUnique(res.available)
            setUsernameChecked(true)
            setCheckingUsername(false)
        })
    }, [debouncedUsername, isValidFormat, isValidLength])

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
                    }
                } catch (error) {
                    console.error('Error fetching pincode:', error)
                }
            })
        }
    }

    const handleSave = async () => {
        setError('')
        setHasSubmitted(true)
        if (isUsernameUnique === false) {
            setError('This username is already taken.')

            return
        }

        const isFormValid =
            name.trim() &&
            isValidFormat &&
            isValidLength &&
            isUsernameUnique === true &&
            gender &&
            !dobError &&
            pincode.length === 6 &&
            city.trim() &&
            district.trim() &&
            state.trim()

        if (!isFormValid) return

        setLoading(true)
        try {
            const res = await createUser({
                name: user.name as string,
                username: user.username as string,
                gender: user.gender as 'male' | 'female' | 'other',
                dob: dob || null,
                address: {
                    city,
                    district,
                    state,
                    pincode: pincode ? Number(pincode) : undefined,
                    country,
                },
            })

            if (res?.error) throw new Error(res.error)
            setDob('')
            setDobError('')
            window.location.href = `/@${username}`
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleUsernameChange = (value: string) => {
        const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '')

        setUser({ username: cleaned.slice(0, MAX_LENGTH) })
    }

    return (
        <Form
            onSubmit={async (event) => {
                event.preventDefault()
                await handleSave()
            }}
        >
            <DrawerHeader className='w-full py-2'>
                <DrawerTitle className='text-xl font-semibold'>Introduce Yourself</DrawerTitle>
                <DrawerDescription className='text-muted-foreground text-sm'>
                    We need some more information to create your account.
                </DrawerDescription>
            </DrawerHeader>
            <div className='w-full space-y-10 px-2'>
                <FieldInput
                    autoFocus
                    error={showNameError && !name.trim() ? 'Name is required' : undefined}
                    invalid={showNameError && !name.trim()}
                    label='Name'
                    placeholder='Enter your full name'
                    prefix={<UserRound className='text-muted-foreground' size={18} />}
                    required
                    value={name}
                    onChange={(value) => setUser({ name: value })}
                />
                <FieldInput
                    description='Choose wisely - username is permanent!'
                    error={usernameError}
                    invalid={
                        showUsernameError &&
                        (!isValidFormat || !isValidLength || isUsernameUnique === false)
                    }
                    label='Username'
                    placeholder='Enter a username'
                    prefix={<AtSign className='text-muted-foreground' size={18} />}
                    required
                    suffix={
                        checkingUsername ? (
                            <Loader className='text-muted-foreground h-4 w-4 shrink-0 animate-spin' />
                        ) : usernameChecked ? (
                            isUsernameUnique ? (
                                <Check className='text-success h-4 w-4 shrink-0' />
                            ) : (
                                <X className='text-danger h-4 w-4 shrink-0' />
                            )
                        ) : null
                    }
                    value={username}
                    onChange={handleUsernameChange}
                />
            </div>
            <div className='space-y-4 px-2'>
                <div className='flex items-center gap-3'>
                    <FieldInput
                        label='Pincode'
                        maxLength={6}
                        placeholder='203205'
                        required
                        suffix={
                            isPendingPincode ? (
                                <Loader className='text-muted-foreground h-4 w-4 shrink-0 animate-spin' />
                            ) : null
                        }
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
                <div className='flex items-center gap-3'>
                    <FieldInput
                        label='District'
                        placeholder='District'
                        required
                        value={district}
                        onChange={setDistrict}
                    />
                    <FieldInput
                        label='State'
                        placeholder='State'
                        required
                        value={state}
                        onChange={setState}
                    />
                </div>
            </div>
            <div className='space-y-4 px-2'>
                <Dob
                    description='Enter your birth date (must be 18+)'
                    isRequired
                    label='Date of Birth'
                    value={dob}
                    onChange={(value) => {
                        setDob(value)
                        setUser({ dob: value })
                    }}
                    onError={setDobError}
                />
                <RadioGroup
                    isRequired
                    orientation='horizontal'
                    value={gender}
                    onChange={(value) => setUser({ gender: value as 'male' | 'female' | 'other' })}
                >
                    <Label>Gender</Label>
                    <Radio value='male'>Male</Radio>
                    <Radio value='female'>Female</Radio>
                    <Radio value='other'>Other</Radio>
                </RadioGroup>
            </div>
            <DrawerFooter className='w-full'>
                <Button
                    isDisabled={
                        loading ||
                        !name.trim() ||
                        !isValidFormat ||
                        !isValidLength ||
                        isUsernameUnique !== true ||
                        !gender ||
                        !!dobError ||
                        pincode.length !== 6 ||
                        !city.trim() ||
                        !district.trim() ||
                        !state.trim()
                    }
                    isPending={loading}
                    type='submit'
                    variant='primary'
                >
                    {loading ? 'Saving...' : 'Create Account'}
                </Button>
            </DrawerFooter>
        </Form>
    )
}
