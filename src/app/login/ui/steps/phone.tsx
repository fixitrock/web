'use client'

import { Button, Form, Input } from '@heroui/react'
import { ConfirmationResult, signInWithPhoneNumber } from 'firebase/auth'
import Link from 'next/link'

import { LoginStep } from '®app/login/types'
import { firebaseAuth } from '®firebase/client'
import { useRecaptcha } from '®app/login/hooks/useRecaptcha'
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '®ui/drawer'

interface StepPhoneProps {
    phone: string
    setPhone: (val: string) => void
    setStep: (val: LoginStep) => void
    setLoading: (val: boolean) => void
    setError: (val: string) => void
    setConfirmationResult: (val: ConfirmationResult | null) => void
    loading: boolean
}

export function StepPhone({
    phone,
    setPhone,
    setStep,
    setLoading,
    setError,
    setConfirmationResult,
    loading,
}: StepPhoneProps) {
    const recaptchaRef = useRecaptcha()

    const handleSendOtp = async () => {
        setError('')
        setLoading(true)

        try {
            const appVerifier = recaptchaRef.current

            if (!appVerifier) throw new Error('Recaptcha not ready')

            const result = await signInWithPhoneNumber(firebaseAuth, `+91${phone}`, appVerifier)

            setConfirmationResult(result)
            setStep('otp')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const isPhoneValid = /^\d{10}$/.test(phone)

    return (
        <Form
            onSubmit={(e) => {
                e.preventDefault()
                if (isPhoneValid) handleSendOtp()
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
