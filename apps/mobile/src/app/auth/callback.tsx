import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { useURL } from 'expo-linking'

import { useAuth } from '@/src/providers/auth-provider'

export default function AuthCallbackScreen() {
    const url = useURL()
    const { completeFirebaseCallback } = useAuth()
    const [message, setMessage] = useState('Completing sign in...')

    useEffect(() => {
        const run = async () => {
            if (!url) {
                return
            }

            const result = await completeFirebaseCallback(url)

            if (result.error) {
                setMessage(result.error)
                setTimeout(() => router.replace('/auth'), 1200)
                return
            }

            router.replace('/(tabs)')
        }

        void run()
    }, [completeFirebaseCallback, url])

    return (
        <View className='flex-1 items-center justify-center gap-4 bg-[#f5efe2] px-6 dark:bg-[#09090b]'>
            <ActivityIndicator size='large' />
            <Text className='text-foreground/75 text-center text-base'>{message}</Text>
        </View>
    )
}
