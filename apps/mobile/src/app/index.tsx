import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

import { useAuth } from '@/src/providers/auth-provider'

export default function IndexScreen() {
    const { isAuthenticated, isReady } = useAuth()

    if (!isReady) {
        return (
            <View className='flex-1 items-center justify-center bg-[#f5efe2] dark:bg-[#09090b]'>
                <ActivityIndicator size='large' />
            </View>
        )
    }

    return <Redirect href={isAuthenticated ? '/(tabs)' : '/auth'} />
}
