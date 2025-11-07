'use client'

import { useState, useEffect } from 'react'
import { 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  ConfirmationResult,
  UserCredential
} from 'firebase/auth'

import { firebaseAuth } from '@/firebase/client'
import { useRecaptcha } from './useRecaptcha'

interface FirebasePhoneAuthHook {
  sendOtp: (phoneNumber: string) => Promise<{ verificationId?: string; error?: string }>
  verifyOtp: (verificationId: string, otp: string) => Promise<{ userCredential?: UserCredential; error?: string }>
  confirmationResult: ConfirmationResult | null
  loading: boolean
  error: string | null
}

export function useFirebaseAuth(): FirebasePhoneAuthHook {
  const recaptchaVerifierRef = useRecaptcha()
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendOtp = async (phoneNumber: string): Promise<{ verificationId?: string; error?: string }> => {
    setLoading(true)
    setError(null)
    
    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error('Recaptcha verifier not initialized')
      }
      
      const result = await signInWithPhoneNumber(
        firebaseAuth, 
        phoneNumber, 
        recaptchaVerifierRef.current
      )
      
      setConfirmationResult(result)
      setLoading(false)
      // Return the verification ID which is needed for verification
      return { verificationId: result.verificationId }
    } catch (err: any) {
      setLoading(false)
      const errorMessage = err.message || 'Failed to send OTP'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const verifyOtp = async (
    verificationId: string, 
    otp: string
  ): Promise<{ userCredential?: UserCredential; error?: string }> => {
    setLoading(true)
    setError(null)
    
    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result available. Please send OTP first.')
      }
      
      // Use the confirmation result to verify the OTP
      const userCredential = await confirmationResult.confirm(otp)
      
      setLoading(false)
      return { userCredential }
    } catch (err: any) {
      setLoading(false)
      const errorMessage = err.message || 'Failed to verify OTP'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  // Clean up recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
      }
    }
  }, [])

  return {
    sendOtp,
    verifyOtp,
    confirmationResult,
    loading,
    error
  }
}