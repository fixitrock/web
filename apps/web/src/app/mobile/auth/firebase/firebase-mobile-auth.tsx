'use client'

import { useMemo, useState } from 'react'
import { Button, Card, Form, InputGroup, InputOTP, Label, TextField } from '@heroui/react'
import { signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth'

import { useRecaptcha } from '@/app/login/hooks/useRecaptcha'
import { firebaseAuth } from '@/firebase/client'

const OTP_LENGTH = 6

function isValidRedirect(redirect: string) {
    return /^(station-mobile|exp|exps):\/\//.test(redirect)
}

type Props = {
    redirect: string
    initialPhone: string
}

export function FirebaseMobileAuth({ redirect, initialPhone }: Props) {
    const recaptchaVerifierRef = useRecaptcha()
    const [phone, setPhone] = useState(initialPhone.replace(/\D/g, '').slice(-10))
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

    const canContinue = useMemo(() => /^\d{10}$/.test(phone), [phone])
    const validRedirect = useMemo(() => isValidRedirect(redirect), [redirect])

    const sendOtp = async () => {
        if (!recaptchaVerifierRef.current) {
            setError('Recaptcha not initialized.')
            return
        }

        setError('')
        setLoading(true)

        try {
            const result = await signInWithPhoneNumber(
                firebaseAuth,
                `+91${phone}`,
                recaptchaVerifierRef.current
            )
            setConfirmationResult(result)
            setStep('otp')
        } catch (err: any) {
            setError(err?.message || 'Failed to send OTP.')
        } finally {
            setLoading(false)
        }
    }

    const verifyOtp = async () => {
        if (!confirmationResult) {
            setError('Please request OTP first.')
            return
        }

        setError('')
        setLoading(true)

        try {
            const result = await confirmationResult.confirm(otp)
            const idToken = await result.user.getIdToken()
            const response = await fetch('/api/mobile/auth/firebase', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.error || 'Could not create mobile session.')
            }

            const target = new URL(redirect)
            target.searchParams.set('access_token', data.accessToken)
            target.searchParams.set('refresh_token', data.refreshToken)
            target.searchParams.set('provider', 'firebase')

            window.location.href = target.toString()
        } catch (err: any) {
            setError(err?.message || 'Invalid OTP.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-10'>
            <Card className='w-full border border-black/10 bg-white/95 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-black/70'>
                <div className='space-y-6 p-6'>
                    <div className='space-y-2'>
                        <p className='text-xs font-medium tracking-[0.28em] text-black/45 uppercase dark:text-white/45'>
                            Firebase Bridge
                        </p>
                        <h1 className='text-3xl font-semibold tracking-tight'>
                            Finish mobile sign in
                        </h1>
                        <p className='text-sm leading-6 text-black/65 dark:text-white/65'>
                            Verify your phone with Firebase, then this page will hand a Supabase
                            session back into the Expo app.
                        </p>
                    </div>

                    {!validRedirect ? (
                        <p className='rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300'>
                            Invalid mobile redirect URL.
                        </p>
                    ) : null}

                    <Form
                        className='space-y-5'
                        onSubmit={async (event) => {
                            event.preventDefault()
                            if (!validRedirect) return
                            if (step === 'phone') {
                                await sendOtp()
                            } else {
                                await verifyOtp()
                            }
                        }}
                    >
                        <TextField isRequired>
                            <Label>Phone number</Label>
                            <InputGroup>
                                <InputGroup.Prefix>
                                    <span className='text-default-500 text-sm'>+91</span>
                                </InputGroup.Prefix>
                                <InputGroup.Input
                                    maxLength={10}
                                    placeholder='9927241144'
                                    type='tel'
                                    value={phone}
                                    onChange={(event) =>
                                        setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
                                    }
                                />
                            </InputGroup>
                        </TextField>

                        {step === 'otp' ? (
                            <InputOTP
                                autoFocus
                                className='mx-auto'
                                maxLength={OTP_LENGTH}
                                value={otp}
                                onChange={setOtp}
                            >
                                <InputOTP.Group>
                                    <InputOTP.Slot index={0} />
                                    <InputOTP.Slot index={1} />
                                    <InputOTP.Slot index={2} />
                                </InputOTP.Group>
                                <InputOTP.Separator />
                                <InputOTP.Group>
                                    <InputOTP.Slot index={3} />
                                    <InputOTP.Slot index={4} />
                                    <InputOTP.Slot index={5} />
                                </InputOTP.Group>
                            </InputOTP>
                        ) : null}

                        {error ? (
                            <p className='rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300'>
                                {error}
                            </p>
                        ) : null}

                        <Button
                            className='w-full'
                            isDisabled={
                                !validRedirect || !canContinue || (step === 'otp' && otp.length < 6)
                            }
                            isPending={loading}
                            type='submit'
                            variant='primary'
                        >
                            {step === 'phone' ? 'Send OTP' : 'Verify and return to app'}
                        </Button>

                        {step === 'otp' ? (
                            <Button
                                className='w-full'
                                variant='secondary'
                                onPress={() => {
                                    setStep('phone')
                                    setOtp('')
                                    setError('')
                                }}
                            >
                                Change number
                            </Button>
                        ) : null}
                    </Form>
                </div>
            </Card>
        </div>
    )
}


