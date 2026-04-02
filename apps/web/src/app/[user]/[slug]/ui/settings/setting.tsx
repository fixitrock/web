'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    LinkIcon,
    MapPin,
    Shield,
    Sparkles,
    Store,
    Trash2,
    UserRound,
} from 'lucide-react'
import {
    Button,
    Form,
    InputGroup,
    Label,
    TextField,
    toast,
    Card,
} from '@heroui/react'
import { BiMaleFemale } from 'react-icons/bi'

import { updateUser } from '@/actions/users'
import { User } from '@/app/login/types'
import { appMessages } from '@/config/messages'
import { formatDateTime, openCurrentLocationInMaps } from '@/lib/utils'
import { Dob } from '@/ui/dob'
import { GoogleMaps, Verified } from '@/ui/icons'

const LOCATION_EDIT_ROLES = [2, 3]

function Section({
    icon,
    title,
    subtitle,
    children,
}: {
    icon: React.ReactNode
    title: string
    subtitle: string
    children: React.ReactNode
}) {
    return (
        <Card className='rounded-xl border shadow-none'>
            <Card.Header className='flex items-start gap-3 border-b px-4 py-3'>
                <div className='rounded-xl bg-default/10 p-2'>{icon}</div>
                <div className='flex flex-col'>
                    <h2 className='text-lg font-semibold'>{title}</h2>
                    <p className='text-muted-foreground text-sm'>{subtitle}</p>
                </div>
            </Card.Header>
            <Card.Content className='p-4 md:p-6'>{children}</Card.Content>
        </Card>
    )
}

function Field({
    label,
    value,
    placeholder,
    description,
    disabled = false,
    invalid = false,
    error,
    prefix,
    suffix,
    maxLength,
    type,
    onChange,
}: {
    label: string
    value: string
    placeholder?: string
    description?: string
    disabled?: boolean
    invalid?: boolean
    error?: string
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    maxLength?: number
    type?: string
    onChange?: (value: string) => void
}) {
    return (
        <TextField isInvalid={invalid}>
            <Label>{label}</Label>
            <InputGroup>
                {prefix ? <InputGroup.Prefix>{prefix}</InputGroup.Prefix> : null}
                <InputGroup.Input
                    disabled={disabled}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    type={type}
                    value={value}
                    onChange={(event) => onChange?.(event.target.value)}
                />
                {suffix ? <InputGroup.Suffix>{suffix}</InputGroup.Suffix> : null}
            </InputGroup>
            {description ? <p className='text-muted-foreground mt-1 text-xs'>{description}</p> : null}
            {error ? <p className='text-danger mt-1 text-xs'>{error}</p> : null}
        </TextField>
    )
}

export function Setting({ user }: { user: User }) {
    const [form, setForm] = useState(() => ({ ...user }))
    const bioError = form.bio && form.bio.length > 160 ? 'Bio must be 160 characters or less' : undefined
    const [dobError, setDobError] = useState('')
    const [locationUrlError, setLocationUrlError] = useState('')

    const canEditLocation = typeof user.role === 'number' && LOCATION_EDIT_ROLES.includes(user.role)

    const handleChange = (field: string, value: string) => {
        setForm((previous) => ({ ...previous, [field]: value }))
    }

    const [, formAction, isLoading] = useActionState(
        async (prevState: Record<string, unknown>, formData: FormData) => {
            if (dobError) {
                toast.danger('Please enter a valid date of birth.')
                return prevState
            }

            Object.entries(form).forEach(([key, value]) => {
                formData.set(key, value == null ? '' : String(value))
            })

            try {
                const result = await updateUser(formData)

                if (result && result.user) {
                    setForm({ ...result.user })
                    toast.success(appMessages.profile.saveSuccess)
                }

                return result
            } catch (error) {
                toast.danger(appMessages.profile.saveFailed, {
                    description: error instanceof Error ? error.message : appMessages.common.refreshAndTry,
                })

                return prevState
            }
        },
        {}
    )

    const statusCards = useMemo(
        () => [
            {
                title: 'Status',
                subtitle: 'Current state',
                value: form.active ? 'Active' : 'Inactive',
                accent: form.active ? 'text-green-600' : 'text-red-600',
            },
            {
                title: 'Verification',
                subtitle: 'Account security',
                value: form.verified ? 'Verified' : 'Pending',
                accent: form.verified ? 'text-green-600' : 'text-yellow-600',
            },
            {
                title: 'Joined On',
                subtitle: 'Member since',
                value: formatDateTime(form.created_at),
                accent: 'text-purple-600',
            },
            {
                title: 'Last Login',
                subtitle: 'Recent activity',
                value: user.last_login_at ? formatDateTime(user.last_login_at) : 'Never',
                accent: 'text-orange-600',
            },
        ],
        [form.active, form.created_at, form.verified, user.last_login_at]
    )

    return (
        <Form action={formAction} className='mx-auto flex max-w-7xl flex-col gap-4 rounded-xl p-2 md:p-4'>
            <div className='mb-2 flex w-full items-center gap-4 py-2'>
                <Link href={`/@${user.username}`}>
                    <Button isIconOnly className='bg-muted/40' size='sm' variant='ghost'>
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className='text-3xl font-bold'>Settings</h1>
            </div>

            <Section
                icon={<UserRound className='h-5 w-5' />}
                subtitle='Your basic profile details and identity'
                title='Personal Information'
            >
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <Field
                        description='Your display name'
                        label='Name'
                        placeholder='Enter your full name'
                        prefix={<UserRound className='text-muted-foreground' size={18} />}
                        value={form.name || ''}
                        onChange={(value) => handleChange('name', value)}
                    />
                    <Field
                        description='Cannot be changed'
                        disabled
                        label='Username'
                        prefix={<UserRound className='text-muted-foreground' size={18} />}
                        suffix={form.verified ? <Verified className='size-5' /> : null}
                        value={`fixitrock.com/@${form.username || ''}`}
                    />
                    <Field
                        description='Cannot be changed'
                        disabled
                        label='Phone Number'
                        prefix={<span className='text-muted-foreground text-sm'>+91</span>}
                        value={form.phone ? form.phone.slice(-10) : ''}
                    />
                    <TextField>
                        <Label>Gender</Label>
                        <InputGroup>
                            <InputGroup.Prefix>
                                <BiMaleFemale className='text-muted-foreground' size={18} />
                            </InputGroup.Prefix>
                            <select
                                className='w-full bg-transparent px-3 py-2 outline-none'
                                value={form.gender || ''}
                                onChange={(event) => handleChange('gender', event.target.value)}
                            >
                                <option value=''>Select gender</option>
                                <option value='male'>Male</option>
                                <option value='female'>Female</option>
                                <option value='other'>Other</option>
                            </select>
                        </InputGroup>
                        <p className='text-muted-foreground mt-1 text-xs'>Optional selection</p>
                    </TextField>
                    <Dob
                        description='Must be 18 or older'
                        label='Date of Birth'
                        value={form.dob || ''}
                        onChange={(value) => handleChange('dob', value)}
                        onError={setDobError}
                    />
                </div>
            </Section>

            <Section
                icon={<Sparkles className='h-5 w-5' />}
                subtitle='Tell the world about yourself and your expertise'
                title='About You'
            >
                <TextField isInvalid={Boolean(bioError)}>
                    <Label>Bio</Label>
                    <InputGroup>
                        <InputGroup.TextArea
                            maxLength={160}
                            placeholder='Tell us about yourself...'
                            rows={3}
                            value={form.bio || ''}
                            onChange={(event) => handleChange('bio', event.target.value)}
                        />
                    </InputGroup>
                    <div className='mt-1 flex items-center justify-between text-xs'>
                        <p className='text-muted-foreground'>
                            A compelling bio helps others understand your expertise and personality
                        </p>
                        <span className='text-muted-foreground'>{form.bio?.length || 0}/160</span>
                    </div>
                    {bioError ? <p className='text-danger mt-1 text-xs'>{bioError}</p> : null}
                </TextField>
            </Section>

            {canEditLocation ? (
                <Section
                    icon={<Store className='h-5 w-5' />}
                    subtitle='Your shop or service location details'
                    title='Business'
                >
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <Field
                            description='Your shop address'
                            label='Store/Shop Address'
                            placeholder='e.g. Fix iT Rock, Sikandrabad, India'
                            prefix={<MapPin className='h-4 w-4' />}
                            value={form.location || ''}
                            onChange={(value) => handleChange('location', value)}
                        />
                        <Field
                            description='Google Maps link'
                            error={locationUrlError}
                            invalid={Boolean(locationUrlError)}
                            label='Google Maps URL'
                            placeholder='Paste your Google Maps link here'
                            prefix={<LinkIcon className='h-4 w-4' />}
                            suffix={
                                <Button isIconOnly size='sm' variant='ghost' onPress={openCurrentLocationInMaps}>
                                    <GoogleMaps className='size-6' />
                                </Button>
                            }
                            type='url'
                            value={form.location_url || ''}
                            onChange={(value) => {
                                handleChange('location_url', value)
                                try {
                                    if (value && !/^https?:\/\//.test(value)) {
                                        setLocationUrlError('Please enter a valid URL starting with http:// or https://')
                                    } else if (value) {
                                        new URL(value)
                                        setLocationUrlError('')
                                    } else {
                                        setLocationUrlError('')
                                    }
                                } catch {
                                    setLocationUrlError('Please enter a valid URL')
                                }
                            }}
                        />
                    </div>
                </Section>
            ) : null}

            <Section
                icon={<Shield className='h-5 w-5' />}
                subtitle='Your account information and activity'
                title='Account Status'
            >
                <div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    {statusCards.map((item, index) => (
                        <Card key={index} className='border shadow-none'>
                            <Card.Content className='p-4'>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex items-center gap-2'>
                                        {index === 0 ? <CheckCircle className='h-5 w-5' /> : null}
                                        {index === 1 ? <Shield className='h-5 w-5' /> : null}
                                        {index === 2 ? <Calendar className='h-5 w-5' /> : null}
                                        {index === 3 ? <Clock className='h-5 w-5' /> : null}
                                        <span className='font-semibold'>{item.title}</span>
                                    </div>
                                    <p className='text-muted-foreground text-sm'>{item.subtitle}</p>
                                    <p className={`text-sm font-medium ${item.accent}`}>{item.value}</p>
                                </div>
                            </Card.Content>
                        </Card>
                    ))}
                </div>
            </Section>

            <div className='flex w-full items-center justify-between border-t pt-4'>
                <div className='flex items-center gap-2'>
                    <Button className='border-danger rounded-sm border' size='sm' variant='danger'>
                        <Trash2 className='mr-2 size-4' />
                        Delete Account
                    </Button>
                    <p className='text-muted-foreground hidden text-xs sm:block'>
                        Permanently remove your account
                    </p>
                </div>
                <Button
                    className='rounded-sm'
                    isDisabled={Boolean(bioError || dobError || locationUrlError)}
                    isPending={isLoading}
                    size='sm'
                    type='submit'
                    variant='primary'
                >
                    {isLoading ? 'Saving . . .' : 'Save Changes'}
                </Button>
            </div>
        </Form>
    )
}
