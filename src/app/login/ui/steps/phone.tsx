'use client'

import { Button, Form, Input } from '@heroui/react'
import Link from 'next/link'

import { sendOtp } from '@/actions/user'
import { LoginStep } from '@/app/login/types'
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/drawer'
import { authConfig } from '@/config/auth'
import { firebaseAuth } from '@/firebase/client'
import { signInWithPhoneNumber } from 'firebase/auth'
import { useRecaptcha } from '@/app/login/hooks/useRecaptcha'

interface StepPhoneProps {
    phone: string
    setPhone: (val: string) => void
    setStep: (val: LoginStep) => void
    setLoading: (val: boolean) => void
    setError: (val: string) => void
    loading: boolean
}

export function StepPhone({
    phone,
    setPhone,
    setStep,
    setLoading,
    setError,
    loading,
}: StepPhoneProps) {
    const isPhoneValid = /^\d{10}$/.test(phone)
    const recaptchaVerifierRef = useRecaptcha()

    const handleSendOtp = async () => {
        setError('')
        setLoading(true)
        try {
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`

            if (authConfig.provider === 'firebase') {
                if (!recaptchaVerifierRef.current) {
                    throw new Error('Recaptcha not initialized')
                }
                
                const confirmationResult = await signInWithPhoneNumber(
                    firebaseAuth, 
                    formattedPhone, 
                    recaptchaVerifierRef.current
                )
                window.confirmationResult = confirmationResult
                setStep('otp')
            } else {
                const res = await sendOtp(formattedPhone)
                if (res.error) {
                    setError(res.error)
                } else {
                    setStep('otp')
                }
            }
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to send OTP')
            if (window.recaptchaVerifier) {
                // recaptchaVerifierRef.current was cleared by hook logic potentially, 
                // but checking window just in case or try ref
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form
            onSubmit={async (e) => {
                e.preventDefault()
                if (isPhoneValid) await handleSendOtp()
            }}
        >
            <DrawerHeader className='w-full py-2 text-balance'>
                <DrawerTitle className='text-xl font-semibold'>
                    Enter Your Mobile Number
                </DrawerTitle>
                <DrawerDescription className='text-muted-foreground text-sm'>
                    We will send you an OTP to verify your number.
                </DrawerDescription>
            </DrawerHeader>
            <Input
                autoFocus
                required
                className='px-4'
                maxLength={10}
                name='phone'
                placeholder='9927XXXXXX'
                startContent={<span className='text-muted-foreground text-sm'>+91</span>}
                type='tel'
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
            <DrawerFooter className='w-full'>
                <Button
                    color={isPhoneValid ? 'primary' : 'default'}
                    isDisabled={!isPhoneValid}
                    isLoading={loading}
                    type='submit'
                >
                    {loading ? 'Sending...' : 'Send OTP'}
                </Button>{' '}
                <div className='mx-auto flex' id='recaptcha-container' />
                <Link
                    passHref
                    className='text-muted-foreground hover:text-primary text-center text-xs'
                    href='/terms'
                    target='_blank'
                >
                    Terms & Conditions
                </Link>
            </DrawerFooter>
        </Form>
    )
}
