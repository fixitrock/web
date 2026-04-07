'use client'

import { Usb, Cable, Link, Unlink, Smartphone, Zap, HardDrive } from 'lucide-react'
import { Button, Card, CardHeader } from '@heroui/react'

import { USBDeviceInfo } from '@/lib/usb/useUSB'
import { ADBDevice, FastbootDevice, SerialDeviceDetails } from '@/lib/usb/enhanced-serial-detector'
import { DeviceDetails } from '@/lib/usb/device-detector'
import { Badge } from '@/ui/badge'
import { CardContent, CardTitle } from '@/ui/card'

interface UnifiedDeviceCardProps {
    device: USBDeviceInfo | SerialDeviceDetails
    onConnect?: (device: USBDeviceInfo | SerialDeviceDetails) => void
    onDisconnect?: (device: USBDeviceInfo | SerialDeviceDetails) => void
    onAnalyze?: (device: SerialDeviceDetails) => void
    deviceDetails?: DeviceDetails | null
    isAnalyzing?: boolean
}

function isSerialDevice(
    device: USBDeviceInfo | SerialDeviceDetails
): device is SerialDeviceDetails {
    return 'portInfo' in device
}

export function DeviceCard({
    device,
    onConnect,
    onDisconnect,
    onAnalyze,
    deviceDetails,
    isAnalyzing = false,
}: UnifiedDeviceCardProps) {
    const getDeviceIcon = () => {
        if (isSerialDevice(device)) {
            switch (device.mode) {
                case 'adb':
                    return <Smartphone className='h-6 w-6 text-green-600' />
                case 'fastboot':
                    return <Zap className='h-6 w-6 text-orange-600' />
                case 'generic':
                    return <HardDrive className='h-6 w-6 text-blue-600' />
                default:
                    return <Cable className='h-6 w-6 text-slate-600' />
            }
        }

        // USB device icons
        if (device.type === 'serial') {
            return <Cable className='h-6 w-6 text-slate-600' />
        }

        // Show specific icons based on detected mode
        if (deviceDetails?.currentMode?.type === 'adb') {
            return <Smartphone className='h-6 w-6 text-green-600' />
        }
        if (deviceDetails?.currentMode?.type === 'fastboot') {
            return <Zap className='h-6 w-6 text-orange-600' />
        }
        if (deviceDetails?.currentMode?.type === 'mtp') {
            return <HardDrive className='h-6 w-6 text-blue-600' />
        }

        return <Usb className='h-6 w-6 text-slate-600' />
    }

    const getStatusBadge = () => {
        let isConnected = false

        if (isSerialDevice(device)) {
            isConnected = device.mode !== 'unknown'
        } else {
            isConnected = device.connected
        }

        if (isConnected) {
            return (
                <Badge className='border-emerald-200 bg-emerald-100 text-emerald-800'>
                    <Link className='mr-1 h-3 w-3' />
                    Connected
                </Badge>
            )
        }

        return (
            <Badge className='text-slate-600' variant='outline'>
                <Unlink className='mr-1 h-3 w-3' />
                Disconnected
            </Badge>
        )
    }

    const getCurrentModeInfo = () => {
        let mode = null

        if (isSerialDevice(device) && device.mode !== 'unknown') {
            mode = { type: device.mode, name: device.mode.toUpperCase() }
        } else if (deviceDetails?.currentMode) {
            mode = deviceDetails.currentMode
        }

        if (!mode) return null

        let className = 'bg-slate-100 text-slate-800'

        switch (mode.type) {
            case 'adb':
                className = 'bg-green-100 text-green-800'
                break
            case 'fastboot':
                className = 'bg-orange-100 text-orange-800'
                break
            case 'mtp':
            case 'generic':
                className = 'bg-blue-100 text-blue-800'
                break
        }

        return <Badge className={className}>{mode.name}</Badge>
    }

    const getDeviceName = () => {
        if (isSerialDevice(device)) {
            if (device.deviceInfo) {
                if ('model' in device.deviceInfo) {
                    const adbDevice = device.deviceInfo as ADBDevice

                    return adbDevice.model || adbDevice.product || 'Android Device'
                } else if ('product' in device.deviceInfo) {
                    const fastbootDevice = device.deviceInfo as FastbootDevice

                    return fastbootDevice.product || 'Fastboot Device'
                }
            }

            return 'Serial Device'
        }

        return device.name
    }

    const getManufacturer = () => {
        if (isSerialDevice(device)) {
            if (device.deviceInfo && 'manufacturer' in device.deviceInfo) {
                return device.deviceInfo.manufacturer
            }

            return 'Unknown'
        }

        return device.manufacturer || 'Unknown'
    }

    const getProduct = () => {
        if (isSerialDevice(device)) {
            if (device.deviceInfo) {
                if ('model' in device.deviceInfo) {
                    return (device.deviceInfo as ADBDevice).model
                } else if ('product' in device.deviceInfo) {
                    return (device.deviceInfo as FastbootDevice).product
                }
            }

            return 'Serial Device'
        }

        return device.product || 'USB Device'
    }

    const getDeviceId = () => {
        if (isSerialDevice(device)) {
            const vendorId = device.portInfo.usbVendorId?.toString(16).padStart(4, '0') || '0000'
            const productId = device.portInfo.usbProductId?.toString(16).padStart(4, '0') || '0000'

            return `${vendorId}:${productId}`
        }

        if (device.vendorId && device.productId) {
            return `${device.vendorId.toString(16).padStart(4, '0')}:${device.productId.toString(16).padStart(4, '0')}`
        }

        return '0000:0000'
    }

    const getDeviceType = () => {
        if (isSerialDevice(device)) {
            return 'Serial Device'
        }

        return `${device.type} Device`
    }

    return (
        <>
            <Card className='overflow-hidden border-0 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl'>
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 to-transparent' />

                <CardHeader className='relative pb-4'>
                    <CardTitle className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='rounded-xl bg-slate-100 p-2'>{getDeviceIcon()}</div>
                            <div>
                                <h3 className='truncate text-lg font-bold text-slate-900'>
                                    {getDeviceName()}
                                </h3>
                                <p className='text-sm font-medium text-slate-500 capitalize'>
                                    {getDeviceType()}
                                </p>
                            </div>
                        </div>
                        {getStatusBadge()}
                    </CardTitle>
                </CardHeader>

                <CardContent className='relative space-y-6'>
                    <div className='space-y-3'>
                        <div className='flex justify-between text-sm'>
                            <span className='font-medium text-slate-500'>Manufacturer:</span>
                            <span className='font-semibold text-slate-900'>
                                {String(getManufacturer() ?? '')}
                            </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='font-medium text-slate-500'>Product:</span>
                            <span className='ml-2 truncate font-semibold text-slate-900'>
                                {getProduct()}
                            </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='font-medium text-slate-500'>Device ID:</span>
                            <span className='rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-900'>
                                {getDeviceId()}
                            </span>
                        </div>
                    </div>

                    {getCurrentModeInfo() && (
                        <div className='flex items-center justify-between rounded-xl bg-slate-50 p-3'>
                            <span className='text-sm font-medium text-slate-600'>
                                Current Mode:
                            </span>
                            {getCurrentModeInfo()}
                        </div>
                    )}

                    {((isSerialDevice(device) && device.capabilities.length > 0) ||
                        (deviceDetails &&
                            (deviceDetails.adbEnabled ||
                                deviceDetails.fastbootMode ||
                                deviceDetails.mtpEnabled))) && (
                        <div className='flex flex-wrap gap-2'>
                            {isSerialDevice(device) ? (
                                device.capabilities.map((capability, index) => (
                                    <Badge
                                        key={index}
                                        className='border-blue-200 bg-blue-50 text-xs text-blue-700'
                                        variant='outline'
                                    >
                                        {capability}
                                    </Badge>
                                ))
                            ) : (
                                <>
                                    {deviceDetails?.adbEnabled && (
                                        <Badge
                                            className='border-emerald-200 bg-emerald-50 text-xs text-emerald-700'
                                            variant='outline'
                                        >
                                            <Smartphone className='mr-1 h-3 w-3' />
                                            ADB
                                        </Badge>
                                    )}
                                    {deviceDetails?.fastbootMode && (
                                        <Badge
                                            className='border-amber-200 bg-amber-50 text-xs text-amber-700'
                                            variant='outline'
                                        >
                                            <Zap className='mr-1 h-3 w-3' />
                                            Fastboot
                                        </Badge>
                                    )}
                                    {deviceDetails?.mtpEnabled && (
                                        <Badge
                                            className='border-blue-200 bg-blue-50 text-xs text-blue-700'
                                            variant='outline'
                                        >
                                            <HardDrive className='mr-1 h-3 w-3' />
                                            MTP
                                        </Badge>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className='flex gap-3 pt-2'>
                        {(!isSerialDevice(device) && device.connected) ||
                        (isSerialDevice(device) && device.mode !== 'unknown') ? (
                            <Button
                                className='flex-1'
                                size='sm'
                                onPress={() => onDisconnect?.(device)}
                            >
                                Disconnect
                            </Button>
                        ) : (
                            <Button
                                className='flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                disabled={isAnalyzing}
                                size='sm'
                                onPress={() => {
                                    if (isSerialDevice(device) && onAnalyze) {
                                        onAnalyze(device)
                                    } else if (onConnect) {
                                        onConnect(device)
                                    }
                                }}
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Identify'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
