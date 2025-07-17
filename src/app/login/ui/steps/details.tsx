'use client'

import { Button, Form, Input, Radio, RadioGroup } from '@heroui/react'
import { AtSign, Loader, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'

import { checkUsername, createUser } from '®actions/auth'
import { useDebounce } from '®app/login/hooks/useDebounce'
import { User } from '®app/login/types'
import { Dob } from '®ui/dob'
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '®ui/drawer'

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

    const isValidFormat = USERNAME_REGEX.test(username)
    const isValidLength = username.length >= MIN_LENGTH && username.length <= MAX_LENGTH

    const showUsernameError = hasSubmitted || username.length > 0
    const showNameError = hasSubmitted || name.length > 0

    useEffect(() => {
        if (!debouncedUsername || !isValidFormat || !isValidLength) {
            setUsernameChecked(false)
            setIsUsernameUnique(null)

            return
        }

        const check = async () => {
            setCheckingUsername(true)
            const available = await checkUsername(debouncedUsername)

            setIsUsernameUnique(available)
            setUsernameChecked(true)
            setCheckingUsername(false)
        }

        check()
    }, [debouncedUsername])

    const handleSave = async () => {
        setError('')
        setHasSubmitted(true)

        const isFormValid =
            name.trim() &&
            isValidFormat &&
            isValidLength &&
            isUsernameUnique === true &&
            gender &&
            !dobError

        if (!isFormValid) return

        setLoading(true)

        try {
            const res = await createUser({
                name: user.name as string,
                username: user.username as string,
                gender: user.gender as string,
                dob: dob || null,
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

    const handleUsernameChange = (val: string) => {
        const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '')

        setUser({ username: cleaned.slice(0, MAX_LENGTH) })
    }

    return (
        <Form
            onSubmit={(e) => {
                e.preventDefault()
                handleSave()
            }}
        >
            <DrawerHeader className='w-full px-0 py-2'>
                <DrawerTitle className='text-xl font-semibold'>Interdouce Yourself</DrawerTitle>
                <DrawerDescription className='text-muted-foreground text-sm'>
                    We need some more information to create your account.
                </DrawerDescription>
            </DrawerHeader>
            <div className='w-full space-y-10'>
                <Input
                    autoFocus
                    isRequired
                    errorMessage={showNameError && !name.trim() ? 'Name is required' : undefined}
                    isInvalid={showNameError && !name.trim()}
                    label='Name'
                    labelPlacement='outside'
                    placeholder='Enter your full name'
                    startContent={<UserRound className='text-muted-foreground' size={18} />}
                    value={name}
                    onChange={(e) => setUser({ name: e.target.value })}
                />

                <Input
                    isRequired
                    description='Choose wisely - username is permanent!'
                    endContent={
                        checkingUsername ? (
                            <Loader className='text-muted-foreground h-4 w-4 shrink-0 animate-spin' />
                        ) : usernameChecked ? (
                            isUsernameUnique ? (
                                <span>✅</span>
                            ) : (
                                <span>❌</span>
                            )
                        ) : null
                    }
                    errorMessage={
                        !showUsernameError
                            ? undefined
                            : !username
                              ? 'Username is required'
                              : !isValidFormat
                                ? 'Only lowercase letters, numbers, and underscores allowed'
                                : !isValidLength
                                  ? `Must be at least ${MIN_LENGTH} characters`
                                  : usernameChecked && isUsernameUnique === false
                                    ? 'This username is already taken'
                                    : undefined
                    }
                    isInvalid={
                        showUsernameError &&
                        (!isValidFormat || !isValidLength || isUsernameUnique === false)
                    }
                    label='Username'
                    labelPlacement='outside'
                    placeholder='Enter a username'
                    startContent={<AtSign className='text-muted-foreground' size={18} />}
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                />
            </div>
            <div className='space-y-4'>
                <Dob
                    isRequired
                    description='Enter your birth date (must be 18+)'
                    label='Date of Birth'
                    value={dob}
                    onChange={(val) => {
                        setDob(val)
                        setUser({ dob: val })
                    }}
                    onError={setDobError}
                />

                <RadioGroup
                    isRequired
                    classNames={{ label: 'text-muted-forground' }}
                    label='Gender'
                    orientation='horizontal'
                    value={gender}
                    onValueChange={(val) => setUser({ gender: val as 'male' | 'female' | 'other' })}
                >
                    <Radio value='male'>Male</Radio>
                    <Radio value='female'>Female</Radio>
                    <Radio value='other'>Other</Radio>
                </RadioGroup>
            </div>
            <DrawerFooter className='w-full'>
                <Button
                    color='primary'
                    isDisabled={
                        loading ||
                        !name.trim() ||
                        !isValidFormat ||
                        !isValidLength ||
                        isUsernameUnique !== true ||
                        !gender ||
                        !!dobError
                    }
                    isLoading={loading}
                    type='submit'
                >
                    {loading ? 'Saving...' : 'Create Account'}
                </Button>
            </DrawerFooter>
        </Form>
    )
}
