import { Button, Card } from 'heroui-native'
import { Text, View } from 'react-native'

type Props = {
    title: string
    description: string
    ctaLabel?: string
    onPress?: () => void
}

export function LockedCard({ title, description, ctaLabel = 'Go to login', onPress }: Props) {
    return (
        <Card className='border border-black/8 bg-white/85 shadow-none dark:border-white/10 dark:bg-white/5'>
            <Card.Body className='gap-3 p-5'>
                <View className='size-11 items-center justify-center rounded-2xl bg-[#101010] dark:bg-[#f3f3f3]'>
                    <Text className='text-lg font-semibold text-white dark:text-black'>
                        {title.slice(0, 1)}
                    </Text>
                </View>
                <View className='gap-1'>
                    <Text className='text-foreground text-xl font-semibold'>{title}</Text>
                    <Text className='text-foreground/70 text-sm leading-6'>{description}</Text>
                </View>
                {onPress ? (
                    <Button className='self-start rounded-full px-5' onPress={onPress}>
                        <Button.Label>{ctaLabel}</Button.Label>
                    </Button>
                ) : null}
            </Card.Body>
        </Card>
    )
}
