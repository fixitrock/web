import Feather from '@expo/vector-icons/Feather'
import { BlurView } from 'expo-blur'
import { Redirect, Tabs } from 'expo-router'
import { StyleSheet, useColorScheme } from 'react-native'

import { useAuth } from '@/src/providers/auth-provider'

export default function TabsLayout() {
    const { isAuthenticated, isReady } = useAuth()
    const colorScheme = useColorScheme()

    if (!isReady) {
        return null
    }

    if (!isAuthenticated) {
        return <Redirect href='/auth' />
    }

    const isDark = colorScheme === 'dark'

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: isDark ? '#f5d07b' : '#a15f08',
                tabBarInactiveTintColor: isDark ? '#8f8f95' : '#6b675f',
                tabBarLabelStyle: {
                    fontSize: 11,
                },
                tabBarStyle: {
                    position: 'absolute',
                    left: 16,
                    right: 16,
                    bottom: 18,
                    height: 72,
                    borderTopWidth: 0,
                    borderRadius: 26,
                    backgroundColor: 'transparent',
                    elevation: 0,
                    overflow: 'hidden',
                },
                tabBarBackground: () => (
                    <BlurView
                        intensity={90}
                        tint={isDark ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                ),
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Shortcuts',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name='grid' size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='space'
                options={{
                    title: 'Space',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name='search' size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='orders'
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name='shopping-bag' size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='transactions'
                options={{
                    title: 'Transactions',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name='repeat' size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}
