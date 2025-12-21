'use client'

import { useState } from 'react'
import { Button, Form, InputOtp } from '@heroui/react'
import { Timer } from 'lucide-react'
import { useEffect } from 'react'

import { LoginStep } from '@/app/login/types'
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/ui/drawer'
import { verifyOtp } from '@/actions/user'
import { verifyFirebaseLogin } from '@/actions/user/firebase'
import { authConfig } from '@/config/auth'

interface StepOtpProps {
    otp: string
    setOtp: (val: string) => void
    setStep: (val: LoginStep) => void
    loading: boolean
    setLoading: (val: boolean) => void
    setError: (val: string) => void
    resendOtp: () => void
    phone: string
}

const OTP_LENGTH = 6
const RESEND_TIMEOUT = 60 // in seconds

export function StepOtp({
    otp,
    setOtp,
    setStep,
    loading,
    setLoading,
    setError,
    resendOtp,
    phone,
}: StepOtpProps) {
    const [secondsLeft, setSecondsLeft] = useState(RESEND_TIMEOUT)

    // Timer logic
    useState(() => {
        const interval = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        return () => clearInterval(interval)
    })

    // Auto-verify OTP when full OTP is entered
    useEffect(() => {
        if (otp.length === OTP_LENGTH && !loading) {
            handleVerifyOtp()
        }
    }, [otp])

    const formatTime = (secs: number) => {
        const m = String(Math.floor(secs / 60)).padStart(2, '0')
        const s = String(secs % 60).padStart(2, '0')

        return `${m}:${s}`
    }

    const handleVerifyOtp = async () => {
        setError('')
        setLoading(true)
        
        try {
            if (authConfig.provider === 'firebase') {
                if (!window.confirmationResult) {
                    throw new Error('Please request OTP first.')
                }

                const result = await window.confirmationResult.confirm(otp)
                const idToken = await result.user.getIdToken()

                const res = await verifyFirebaseLogin(idToken)
                
                setLoading(false)
                
                if (res.user) {
                    window.location.href = `/@${res.user.username}`
                } else if (res.error) {
                    setError(res.error)
                } else {
                    // Success but no profile -> New User
                    setStep('details')
                }
            } else {
                const res = await verifyOtp('+91' + phone, otp)
        
                setLoading(false)
                if (res.error) setError(res.error)
                else if (res.user) {
                    window.location.href = `/@${res.user.username}`
                } else {
                    setStep('details')
                }
            }
        } catch (err: any) {
            setLoading(false)
            setError(err.message || 'Invalid OTP')
        }
    }

    const handleResend = () => {
        if (secondsLeft === 0) {
            resendOtp()
            setSecondsLeft(RESEND_TIMEOUT)
        }
    }

    return (
        <Form
            onSubmit={async (e) => {
                e.preventDefault()
                await handleVerifyOtp()
            }}
        >
            <DrawerHeader className='w-full py-2'>
                <DrawerTitle className='text-xl font-semibold'>Enter Verification Code</DrawerTitle>
                <DrawerDescription className='text-accent-foreground text-sm'>
                    Enter the verification code sent to <br />
                    <strong>+91 {phone}</strong>{' '}
                    <button
                        className='text-danger ml-1 font-medium hover:underline'
                        type='button'
                        onClick={() => setStep('phone')}
                    >
                        Wrong number?
                    </button>
                </DrawerDescription>
            </DrawerHeader>
            <InputOtp
                autoFocus
                autoSave=''
                className='mx-auto flex w-full items-center justify-center'
                classNames={{ segmentWrapper: 'gap-x-5' }}
                length={OTP_LENGTH}
                value={otp}
                onValueChange={setOtp}
            />
            <DrawerFooter className='flex w-full flex-col items-center space-y-2'>
                <Button
                    fullWidth
                    color={loading ? 'primary' : otp.length < OTP_LENGTH ? 'default' : 'primary'}
                    isDisabled={otp.length < OTP_LENGTH}
                    isLoading={loading}
                    type='submit'
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                {secondsLeft > 0 && (
                    <p className='text-muted-foreground flex items-center gap-1 text-sm'>
                        <Timer size={18} />
                        <span className='tabular-nums'>{formatTime(secondsLeft)}</span>
                    </p>
                )}
                <div className='text-muted-foreground flex items-center gap-1 text-center text-xs'>
                    <p>Didn't receive the OTP?</p>
                    <button
                        className={`font-medium ${secondsLeft > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary hover:underline'}`}
                        disabled={secondsLeft > 0}
                        type='button'
                        onClick={handleResend}
                    >
                        Resend OTP
                    </button>
                </div>
            </DrawerFooter>
        </Form>
    )
}
