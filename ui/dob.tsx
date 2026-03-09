'use client'

import { useState, useEffect } from 'react'

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/ui/input-otp'
import { Label } from '@/ui/label'

interface DobInputProps {
    label?: string
    description?: string
    errorMessage?: string
    isRequired?: boolean
    value?: string // YYYY-MM-DD
    onChange?: (date: string) => void // YYYY-MM-DD
    onError?: (error: string) => void
    disabled?: boolean
    autoFocus?: boolean
    className?: string
}

export function Dob({
    label = 'Date of Birth',
    description,
    errorMessage,
    isRequired = false,
    value = '',
    onChange,
    onError,
    disabled = false,
    autoFocus = false,
    className = '',
}: DobInputProps) {
    const [day, setDay] = useState('')
    const [month, setMonth] = useState('')
    const [year, setYear] = useState('')
    const [error, setError] = useState('')
    const [touched, setTouched] = useState(false)

    useEffect(() => {
        if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [y, m, d] = value.split('-')

            setDay(d)
            setMonth(m)
            setYear(y)
            setError('')
        } else if (!value) {
            setDay('')
            setMonth('')
            setYear('')
            setError('')
        }
    }, [value])

    const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

    const getMaxDays = (m: number, y: number) => {
        if (m === 2) return isLeapYear(y) ? 29 : 28
        if ([4, 6, 9, 11].includes(m)) return 30

        return 31
    }

    const isAtLeast18 = (y: number, m: number, d: number) => {
        const today = new Date()
        const dob = new Date(y, m - 1, d)
        const age = today.getFullYear() - dob.getFullYear()
        const mDiff = today.getMonth() - dob.getMonth()
        const dDiff = today.getDate() - dob.getDate()

        return age > 18 || (age === 18 && (mDiff > 0 || (mDiff === 0 && dDiff >= 0)))
    }
    const validate = (d: string, m: string, y: string) => {
        const today = new Date()
        const minYear = 1900
        const maxYear = today.getFullYear()

        if (!d && !m && !y) return ''

        const dayNum = Number(d)
        const monthNum = Number(m)
        const yearNum = Number(y)

        if (d.length === 2 && (dayNum < 1 || dayNum > 31))
            return 'Hmm, days go from 01 to 31. Not 33 😅'
        if (m.length === 2 && (monthNum < 1 || monthNum > 12))
            return "There's no month 13... yet! Try 01 to 12 🗓️"
        if (y.length > 0 && y.length < 4)
            return 'A year has 4 digits — unless you’re a time traveler 🤖'
        if (y.length === 4) {
            if (yearNum < minYear) return 'That’s way too vintage! Try something after 1900 🕰️'
            if (yearNum > maxYear) return 'Whoa! That’s from the future. Are you a wizard? 🔮'
        }

        if (d.length === 2 && m.length === 2 && y.length === 4) {
            const maxDay = getMaxDays(monthNum, yearNum)

            if (dayNum > maxDay) return `Oops! That month doesn’t have that many days 📆`
            const dob = new Date(yearNum, monthNum - 1, dayNum)
            const age = today.getFullYear() - dob.getFullYear()

            if (age > 120) return 'That’d make you a legend. Try a slightly younger age 🧓'
            if (!isAtLeast18(yearNum, monthNum, dayNum))
                return 'You must be at least 18. Come back when you’re older! 🎂'
            if (isNaN(dob.getTime())) return 'That date doesn’t exist in this timeline 🌀'
        }

        return ''
    }

    const handleOtpChange = (val: string) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 8)

        const d = cleaned.slice(0, 2)
        const m = cleaned.slice(2, 4)
        const y = cleaned.slice(4, 8)

        setDay(d)
        setMonth(m)
        setYear(y)

        const err = validate(d, m, y)

        setError(err)
        onError?.(err)

        if (!err && d.length === 2 && m.length === 2 && y.length === 4) {
            const formatted = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`

            onChange?.(formatted)
        } else {
            onChange?.('')
        }
    }

    const handleFocus = () => {
        setTouched(true)
    }

    const handleBlur = () => {
        setTouched(true)
        const err = validate(day, month, year)

        setError(err)
        onError?.(err)
    }

    const otpValue = `${day.padEnd(2, '')}${month.padEnd(2, '')}${year.padEnd(4, '')}`
    const placeholders = ['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y']
    const showError = (touched || error || errorMessage) && (error || errorMessage)

    return (
        <div className={`${className} flex w-full flex-1 flex-col justify-end`}>
            {label && (
                <Label
                    className={`${isRequired && 'gap-0.5 after:text-red-500 after:content-["*"]'} pb-2`}
                >
                    {label}
                </Label>
            )}
            <InputOTP
                aria-invalid={!!showError}
                aria-label={label}
                aria-required={isRequired}
                autoFocus={autoFocus}
                className=''
                containerClassName={`w-full flex items-start ${showError ? 'border-red-200' : ''}`}
                disabled={disabled}
                inputMode='numeric'
                maxLength={8}
                pattern='[0-9]*'
                value={otpValue}
                onBlur={handleBlur}
                onChange={handleOtpChange}
                onFocus={handleFocus}
            >
                <InputOTPGroup>
                    <InputOTPSlot index={0} placeholder={placeholders[0]} />
                    <InputOTPSlot index={1} placeholder={placeholders[1]} />
                </InputOTPGroup>

                <InputOTPGroup>
                    <InputOTPSlot index={2} placeholder={placeholders[2]} />
                    <InputOTPSlot index={3} placeholder={placeholders[3]} />
                </InputOTPGroup>

                <InputOTPGroup>
                    <InputOTPSlot index={4} placeholder={placeholders[4]} />
                    <InputOTPSlot index={5} placeholder={placeholders[5]} />
                    <InputOTPSlot index={6} placeholder={placeholders[6]} />
                    <InputOTPSlot index={7} placeholder={placeholders[7]} />
                </InputOTPGroup>
            </InputOTP>
            {!showError && description && (
                <div className='text-foreground-400 p-1 text-xs'>{description}</div>
            )}
            {showError && (
                <div className='p-1 text-xs font-medium text-red-500'>{errorMessage || error}</div>
            )}
        </div>
    )
}
