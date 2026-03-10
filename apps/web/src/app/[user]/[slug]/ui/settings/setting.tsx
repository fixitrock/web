'use client'

import React, { useState } from 'react'
import {
    Form,
    Button,
    addToast,
    Card,
    Input,
    Select,
    SelectItem,
    SelectSection,
    Textarea,
    Tooltip,
    Accordion,
    AccordionItem,
    Navbar,
} from '@heroui/react'
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
import Link from 'next/link'
import { useActionState } from 'react'
import { BiMaleFemale } from 'react-icons/bi'

import { User } from '@/app/login/types'
import { updateUser } from '@/actions/users'
import { GoogleMaps, Verified } from '@/ui/icons'
import { formatDateTime, openCurrentLocationInMaps } from '@/lib/utils'
import { Dob } from '@/ui/dob'

const LOCATION_EDIT_ROLES = [2, 3]

export function Setting({ user }: { user: User }) {
    const [form, setForm] = useState(() => ({ ...user }))
    const bioError =
        form.bio && form.bio.length > 160 ? 'Bio must be 160 characters or less' : undefined
    const [dobError, setDobError] = useState('')
    const [locationUrlError, setLocationUrlError] = useState('')

    const canEditLocation = typeof user.role === 'number' && LOCATION_EDIT_ROLES.includes(user.role)

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const [, formAction, isLoading] = useActionState(
        async (prevState: Record<string, unknown>, formData: FormData) => {
            if (dobError) {
                addToast({
                    title: 'Please enter a valid date of birth.',
                    color: 'danger',
                })

                return prevState
            }
            Object.entries(form).forEach(([key, value]) => {
                formData.set(key, value == null ? '' : String(value))
            })
            try {
                const result = await updateUser(formData)

                if (result && result.user) {
                    setForm({ ...result.user })
                    addToast({
                        title: 'Profile settings saved successfully!',
                        color: 'success',
                    })
                }

                return result
            } catch {
                addToast({
                    title: 'Failed to save profile settings',
                    color: 'danger',
                })

                return prevState
            }
        },
        {}
    )

    return (
        <Form
            action={formAction}
            className='mx-auto flex max-w-7xl flex-col gap-4 rounded-xl p-2 md:p-4'
        >
            <Navbar
                shouldHideOnScroll
                classNames={{
                    wrapper: 'h-auto p-0 py-2',
                }}
                maxWidth='full'
            >
                <div className='mb-2 flex w-full items-center gap-4'>
                    <Button
                        isIconOnly
                        passHref
                        as={Link}
                        className='bg-muted/40'
                        href={`/@${user.username}`}
                        radius='full'
                        size='sm'
                        startContent={<ArrowLeft size={20} />}
                        variant='light'
                    />
                    <h1 className='text-3xl font-bold'>Settings</h1>
                </div>
            </Navbar>
            <Accordion
                className='space-y-3 p-0'
                defaultExpandedKeys={['personal-information']}
                itemClasses={{
                    base: 'border rounded-xl',
                    title: 'font-semibold text-lg',
                    subtitle: 'text-muted-foreground text-sm',
                    heading: 'px-4 py-2',
                    content: 'border-t p-4 md:p-6',
                }}
                selectionMode='multiple'
                showDivider={false}
            >
                <AccordionItem
                    key='personal-information'
                    startContent={
                        <div className='rounded-xl bg-linear-to-r from-blue-500 to-cyan-500 p-2 shadow-lg'>
                            <UserRound className='h-5 w-5 text-white' />
                        </div>
                    }
                    subtitle='Your basic profile details and identity'
                    title='Personal Information'
                >
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <Input
                            description='Your display name'
                            label='Name'
                            labelPlacement='outside-top'
                            name='name'
                            placeholder='Enter your full name'
                            startContent={<UserRound className='text-muted-foreground' size={18} />}
                            value={form.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                        <Input
                            isDisabled
                            description='Cannot be changed'
                            endContent={form.verified && <Verified className='size-6' />}
                            label='Username'
                            labelPlacement='outside-top'
                            name='username'
                            startContent={<UserRound className='text-muted-foreground' size={18} />}
                            value={`fixitrock.com/@${form.username || ''}`}
                            onChange={(e) => handleChange('username', e.target.value)}
                        />
                        <Input
                            isDisabled
                            description='Cannot be changed'
                            label='Phone Number'
                            labelPlacement='outside-top'
                            name='phone'
                            startContent={
                                <span className='text-muted-foreground text-sm'>+91</span>
                            }
                            value={form.phone ? form.phone.slice(-10) : ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                        <Select
                            description='Optional selection'
                            label='Gender'
                            labelPlacement='outside'
                            name='gender'
                            placeholder='Select Gender'
                            selectedKeys={form.gender ? [form.gender] : []}
                            startContent={
                                <BiMaleFemale className='text-muted-foreground' size={18} />
                            }
                            onSelectionChange={(keys) =>
                                handleChange('gender', Array.from(keys)[0]?.toString() || '')
                            }
                        >
                            <SelectSection>
                                <SelectItem key='male'>Male</SelectItem>
                                <SelectItem key='female'>Female</SelectItem>
                                <SelectItem key='other'>Other</SelectItem>
                            </SelectSection>
                        </Select>
                        <Dob
                            description='Must be 18 or older'
                            label='Date of Birth'
                            value={form.dob || ''}
                            onChange={(val) => handleChange('dob', val)}
                            onError={setDobError}
                        />
                    </div>
                </AccordionItem>
                <AccordionItem
                    key='about-you'
                    startContent={
                        <div className='rounded-xl bg-linear-to-r from-purple-500 to-pink-500 p-2 shadow-lg'>
                            <Sparkles className='h-5 w-5 text-white' />
                        </div>
                    }
                    subtitle='Tell the world about yourself and your expertise'
                    title='About You'
                >
                    <Textarea
                        classNames={{
                            description: 'flex justify-between',
                            base: 'gap-2',
                            label: 'flex justify-between',
                        }}
                        description={
                            <>
                                <p>
                                    A compelling bio helps others understand your expertise and
                                    personality
                                </p>
                            </>
                        }
                        errorMessage={bioError}
                        id='bio'
                        isInvalid={!!bioError}
                        label={
                            <>
                                <p>Bio</p>
                                <span className='text-muted-foreground text-xs'>
                                    {form.bio?.length || 0}/160
                                </span>
                            </>
                        }
                        labelPlacement='outside'
                        maxLength={160}
                        name='bio'
                        placeholder='Tell us about yourself...'
                        rows={3}
                        value={form.bio || ''}
                        onChange={(e) => handleChange('bio', e.target.value)}
                    />
                </AccordionItem>
                {canEditLocation ? (
                    <AccordionItem
                        key='business'
                        startContent={
                            <div className='rounded-xl bg-linear-to-r from-green-500 to-teal-500 p-2 shadow-lg'>
                                <Store className='h-5 w-5 text-white' />
                            </div>
                        }
                        subtitle='Your shop or service location details'
                        title='Business'
                    >
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Input
                                description='Your shop address'
                                id='location'
                                label='Store/Shop Address'
                                labelPlacement='outside'
                                name='location'
                                placeholder='e.g. Fix iT Rock, Sikandrabad, India'
                                startContent={<MapPin className='h-4 w-4' />}
                                value={form.location || ''}
                                onChange={(e) => handleChange('location', e.target.value)}
                            />
                            <Input
                                description='Google Maps link'
                                endContent={
                                    <Tooltip content='Get your Google Maps URL'>
                                        <Button
                                            isIconOnly
                                            radius='full'
                                            size='sm'
                                            startContent={<GoogleMaps className='size-6' />}
                                            variant='light'
                                            onPress={openCurrentLocationInMaps}
                                        />
                                    </Tooltip>
                                }
                                errorMessage={locationUrlError}
                                id='location_url'
                                isInvalid={!!locationUrlError}
                                label='Google Maps URL'
                                labelPlacement='outside'
                                name='location_url'
                                placeholder='Paste your Google Maps link here'
                                startContent={<LinkIcon className='h-4 w-4' />}
                                type='url'
                                value={form.location_url || ''}
                                onChange={(e) => {
                                    handleChange('location_url', e.target.value)
                                    // Validate URL
                                    try {
                                        if (
                                            e.target.value &&
                                            !/^https?:\/\//.test(e.target.value)
                                        ) {
                                            setLocationUrlError(
                                                'Please enter a valid URL starting with http:// or https://'
                                            )
                                        } else if (e.target.value && !new URL(e.target.value)) {
                                            setLocationUrlError('Please enter a valid URL')
                                        } else {
                                            setLocationUrlError('')
                                        }
                                    } catch {
                                        setLocationUrlError('Please enter a valid URL')
                                    }
                                }}
                            />
                        </div>
                    </AccordionItem>
                ) : null}

                <AccordionItem
                    key='account-status'
                    startContent={
                        <div className='rounded-xl bg-linear-to-r from-indigo-500 to-blue-500 p-2 shadow-lg'>
                            <Shield className='h-5 w-5 text-white' />
                        </div>
                    }
                    subtitle='Your account information and activity'
                    title='Account Status'
                >
                    <div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                        <Card
                            isPressable
                            className='border border-green-200/50 bg-linear-to-br from-green-50 to-emerald-50 dark:border-green-700/30 dark:from-green-900/20 dark:to-emerald-900/20'
                            shadow='none'
                        >
                            <div className='p-4'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                form.active
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                            }`}
                                        >
                                            <CheckCircle className='h-5 w-5' />
                                        </div>
                                        <div className='text-start text-nowrap'>
                                            <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                                                Status
                                            </h3>
                                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                                                Current state
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            form.active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                        }`}
                                    >
                                        {form.active ? '🟢 Active' : '🔴 Inactive'}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card
                            isPressable
                            className='border border-blue-200/50 bg-linear-to-br from-blue-50 to-cyan-50 dark:border-blue-700/30 dark:from-blue-900/20 dark:to-cyan-900/20'
                            shadow='none'
                        >
                            <div className='p-4'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'>
                                            <Shield className='h-5 w-5' />
                                        </div>
                                        <div className='text-start text-nowrap'>
                                            <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                                                Verification
                                            </h3>
                                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                                                Account security
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            form.verified
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                                        }`}
                                    >
                                        {form.verified ? '✅ Verified' : '⏳ Pending'}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card
                            isPressable
                            className='border border-violet-200/50 bg-linear-to-br from-violet-50 to-purple-50 dark:border-violet-700/30 dark:from-violet-900/20 dark:to-purple-900/20'
                            shadow='none'
                        >
                            <div className='p-4'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
                                            <Calendar className='h-5 w-5' />
                                        </div>
                                        <div className='text-start text-nowrap'>
                                            <h3 className='font-semibold text-nowrap text-gray-900 dark:text-gray-100'>
                                                Joined On
                                            </h3>
                                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                                                Member since
                                            </p>
                                        </div>
                                    </div>
                                    <div className='rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-nowrap text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'>
                                        📅 {formatDateTime(form.created_at)}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card
                            isPressable
                            className='border border-orange-200/50 bg-linear-to-br from-orange-50 to-amber-50 dark:border-orange-700/30 dark:from-orange-900/20 dark:to-amber-900/20'
                            shadow='none'
                        >
                            <div className='p-4'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'>
                                            <Clock className='h-5 w-5' />
                                        </div>
                                        <div className='text-start text-nowrap'>
                                            <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                                                Last Login
                                            </h3>
                                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                                                Recent activity
                                            </p>
                                        </div>
                                    </div>
                                    <div className='rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/50 dark:text-orange-200'>
                                        🕐{' '}
                                        {user.last_login_at
                                            ? formatDateTime(user.last_login_at)
                                            : 'Never'}
                                    </div>
                                    {user.last_login_at && (
                                        <div className='absolute top-2 right-2 h-2 w-2 animate-pulse rounded-full bg-green-500' />
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </AccordionItem>
            </Accordion>

            {/* Action Buttons - Save & Delete */}
            <div className='flex w-full items-center justify-between border-t pt-4'>
                <div className='flex items-center gap-2'>
                    <Button
                        className='border-danger rounded-sm border'
                        color='danger'
                        size='sm'
                        startContent={<Trash2 className='size-4' />}
                        variant='light'
                    >
                        Delete Account
                    </Button>
                    <p className='text-muted-foreground hidden text-xs sm:block'>
                        Permanently remove your account
                    </p>
                </div>
                <Button
                    className='rounded-sm'
                    color='primary'
                    isDisabled={!!bioError || !!dobError || !!locationUrlError}
                    isLoading={isLoading}
                    size='sm'
                    type='submit'
                >
                    {isLoading ? 'Saving . . .' : ' Save Changes'}
                </Button>
            </div>
        </Form>
    )
}
