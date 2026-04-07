import { Button, Card } from 'heroui-native'
import { Text, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'

import { AppScreen } from '@/src/components/app-screen'
import { BrandHeader } from '@/src/components/brand-header'
import { makeWebUrl } from '@/src/lib/config'
import { spaceLinks } from '@/src/lib/navigation'

export default function SpaceScreen() {
    return (
        <AppScreen
            header={
                <BrandHeader
                    eyebrow='Space'
                    title='Browse the same categories as the site.'
                    subtitle='Browse the same Fix iT Rock sections and jump into the web workspace when you need the full toolset.'
                />
            }
        >
            <View className='gap-4'>
                {spaceLinks.map((item, index) => (
                    <Card
                        key={item.title}
                        className='border border-black/8 bg-white/85 shadow-none dark:border-white/10 dark:bg-white/5'
                    >
                        <Card.Body className='gap-4 p-5'>
                            <View className='flex-row items-center justify-between'>
                                <Text className='text-foreground/45 text-sm tracking-[1.8px] uppercase'>
                                    Section {String(index + 1).padStart(2, '0')}
                                </Text>
                            </View>
                            <View className='gap-2'>
                                <Text className='text-foreground text-2xl font-semibold'>
                                    {item.title}
                                </Text>
                                <Text className='text-foreground/70 text-sm leading-6'>
                                    {item.description}
                                </Text>
                            </View>
                            <Button
                                variant='secondary'
                                className='self-start rounded-full px-5'
                                onPress={() =>
                                    void WebBrowser.openBrowserAsync(makeWebUrl(item.href))
                                }
                            >
                                <Button.Label>Open on web</Button.Label>
                            </Button>
                        </Card.Body>
                    </Card>
                ))}
            </View>
        </AppScreen>
    )
}
