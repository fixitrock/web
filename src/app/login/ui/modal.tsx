'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { User } from '@/app/login/types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Drawer, DrawerContent } from '@/ui/drawer'
import { Dialog, DialogContent } from '@/ui/dialog'
import { sendOtp } from '@/actions/user'

import { LoginStep } from '../types'

import { StepDetails, StepOtp, StepPhone } from './steps'

export function LoginModal() {
    const router = useRouter()
    const pathname = usePathname()

    const isDesktop = useMediaQuery('(min-width: 768px)')
    const isOpen = pathname === '/login'
    const setIsOpen = () => {
        router.push('/')
    }

    return isDesktop ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className='sm:max-w-md'>
                <Steps />
            </DialogContent>
        </Dialog>
    ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent
                onInteractOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <Steps />
            </DrawerContent>
        </Drawer>
    )
}

function Steps() {
    const [step, setStep] = useState<LoginStep>('phone')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [user, setUserState] = useState<Partial<User>>({})

    const setUser = (val: Partial<User>) => {
        setUserState((prev) => ({ ...prev, ...val }))
    }

    const resendOtp = async () => {
        setError('')
        setLoading(true)
        try {
            // Always format as +91XXXXXXXXXX
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`

            await sendOtp(formattedPhone)
        } catch {
            setError('Failed to resend OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {step === 'phone' && (
                <StepPhone
                    loading={loading}
                    phone={phone}
                    setError={setError}
                    setLoading={setLoading}
                    setPhone={setPhone}
                    setStep={setStep}
                />
            )}

            {step === 'otp' && (
                <StepOtp
                    loading={loading}
                    otp={otp}
                    phone={phone}
                    resendOtp={resendOtp}
                    setError={setError}
                    setLoading={setLoading}
                    setOtp={setOtp}
                    setStep={setStep}
                />
            )}

            {step === 'details' && (
                <StepDetails
                    loading={loading}
                    setError={setError}
                    setLoading={setLoading}
                    setUser={setUser}
                    user={user}
                />
            )}

            {error && <p className='text-center text-sm text-red-500'>{error}</p>}
        </>
    )
}
