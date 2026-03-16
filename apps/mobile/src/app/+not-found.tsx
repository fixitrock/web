import { router } from 'expo-router'
import { Button } from 'heroui-native'
import { Text, View } from 'react-native'

export default function NotFoundScreen() {
    return (
        <View className='flex-1 items-center justify-center gap-4 bg-[#f5efe2] px-8 dark:bg-[#09090b]'>
            <Text className='text-foreground text-3xl font-semibold'>Not found</Text>
            <Text className='text-foreground/70 text-center text-base leading-6'>
                That screen does not exist in the new mobile app shell.
            </Text>
            <Button className='rounded-full px-5' onPress={() => router.replace('/')}>
                <Button.Label>Go home</Button.Label>
            </Button>
        </View>
    )
}
