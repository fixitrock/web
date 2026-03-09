'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Alert, Button, Card, CardBody } from '@heroui/react'
import { Monitor, AlertCircle, Usb, AlertTriangle, Cable, RefreshCw } from 'lucide-react'

import { USBDeviceInfo, useUSBDevices } from '@/lib/usb/useUSB'
import { DeviceDetails, DeviceDetector } from '@/lib/usb/device-detector'
import { SerialDeviceDetails, EnhancedSerialDetector } from '@/lib/usb/enhanced-serial-detector'
import { AlertDescription } from '@/ui/alert'
import { logWarning } from '@/lib/utils'

import { DeviceCard } from '../ui/card'

// Web USB API types
interface USBDevice {
    vendorId: number
    productId: number
    manufacturerName?: string
    productName?: string
    serialNumber?: string
    opened: boolean
    configuration: unknown
    configurations: unknown[]
    open(): Promise<void>
    close(): Promise<void>
    selectConfiguration(configurationValue: number): Promise<void>
}

// Type for DeviceDetector compatibility
interface DeviceDetectorUSBDevice {
    vendorId: number
    productId: number
    manufacturerName?: string
    productName?: string
    serialNumber?: string
    deviceClass?: number
    deviceSubclass?: number
    deviceProtocol?: number
    configurations: Array<{
        configurationValue: number
        configurationName?: string
        interfaces: Array<{
            interfaceNumber: number
            alternate: {
                interfaceClass: number
                interfaceSubclass?: number
                interfaceProtocol?: number
                interfaceName?: string
                endpoints: Array<{
                    endpointNumber: number
                    direction: 'in' | 'out'
                    type: 'bulk' | 'interrupt' | 'isochronous' | 'control'
                    packetSize: number
                }>
            }
            alternates: Array<{
                interfaceClass: number
                interfaceSubclass?: number
                interfaceProtocol?: number
                interfaceName?: string
                endpoints: Array<{
                    endpointNumber: number
                    direction: 'in' | 'out'
                    type: 'bulk' | 'interrupt' | 'isochronous' | 'control'
                    packetSize: number
                }>
            }>
        }>
    }>
}

declare global {
    interface Navigator {
        usb?: {
            getDevices(): Promise<USBDevice[]>
            requestDevice(options: {
                filters: Array<{ vendorId: number; productId: number }>
            }): Promise<USBDevice>
        }
    }
}

export default function DeviceManager() {
    const { devices, error, scanForDevices, requestNewDevice } = useUSBDevices()
    const [connectionStatus, setConnectionStatus] = useState<string>('')
    const [deviceDetails, setDeviceDetails] = useState<Map<string, DeviceDetails>>(new Map())
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [serialDevices, setSerialDevices] = useState<SerialDeviceDetails[]>([])
    const [serialAPIAvailable, setSerialAPIAvailable] = useState(false)

    const previousDeviceCount = useRef(0)

    // Check Serial API availability on mount
    useEffect(() => {
        const available = EnhancedSerialDetector.isSerialAPIAvailable()

        setSerialAPIAvailable(available)
        // Serial API available status logged
    }, [])

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                await scanForDevices()
                if (serialAPIAvailable) {
                    try {
                        await scanForSerialDevices()
                    } catch (error) {
                        // Silently handle serial errors to avoid spam
                        logWarning('Serial scan failed:', error)
                    }
                }
            } catch (error) {
                logWarning('Auto-scan failed:', error)
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [scanForDevices, serialAPIAvailable])

    useEffect(() => {
        const currentDeviceCount = devices.length + serialDevices.length

        if (currentDeviceCount > previousDeviceCount.current && previousDeviceCount.current > 0) {
            // New device detected, auto-connect to the latest USB device
            const newUSBDevices = devices.filter((device) => !deviceDetails.has(device.id))

            if (newUSBDevices.length > 0) {
                const latestDevice = newUSBDevices[0]

                setConnectionStatus(`New device detected: ${latestDevice.name}. Auto-connecting...`)
                handleConnect(latestDevice)
            }

            // Auto-analyze new serial devices
            const newSerialDevices = serialDevices.filter((device) => !device.deviceInfo)

            if (newSerialDevices.length > 0) {
                const latestSerialDevice = newSerialDevices[0]

                setConnectionStatus(`New serial device detected. Auto-analyzing...`)
                handleAnalyzeSerial(latestSerialDevice)
            }
        }

        previousDeviceCount.current = currentDeviceCount
    }, [devices, serialDevices, deviceDetails])

    useEffect(() => {
        const initialScan = async () => {
            await scanForDevices()
            if (serialAPIAvailable) {
                try {
                    await scanForSerialDevices()
                } catch (error) {
                    logWarning('Initial serial scan failed:', error)
                    // Don't show error to user for initial scan
                }
            }
        }

        initialScan()
    }, [scanForDevices, serialAPIAvailable])

    const handleConnect = async (device: USBDeviceInfo) => {
        if (!device.vendorId || !device.productId) {
            setConnectionStatus('Cannot connect: Missing device identifiers')

            return
        }

        try {
            setConnectionStatus(`Connecting to ${device.name}...`)
            setIsAnalyzing(true)

            // First, get the actual USB device from the browser
            if (!navigator.usb) {
                setConnectionStatus('Web USB API not supported')

                return
            }
            const usbDevices = await navigator.usb.getDevices()
            let targetDevice = usbDevices.find(
                (d: USBDevice) => d.vendorId === device.vendorId && d.productId === device.productId
            )

            // If device not found in connected devices, request access
            if (!targetDevice) {
                try {
                    targetDevice = await navigator.usb.requestDevice({
                        filters: [{ vendorId: device.vendorId, productId: device.productId }],
                    })
                } catch (err) {
                    if (err instanceof Error && err.name === 'NotFoundError') {
                        setConnectionStatus('Device access denied or not found')

                        return
                    }
                    throw err
                }
            }

            if (!targetDevice) {
                setConnectionStatus('Failed to access USB device')

                return
            }

            // Open the USB device if not already open
            if (!targetDevice.opened) {
                await targetDevice.open()
                setConnectionStatus(`Opening ${device.name}...`)
            }

            // Select configuration if needed
            if (targetDevice.configuration === null && targetDevice.configurations.length > 0) {
                const config = targetDevice.configurations[0] as { configurationValue: number }

                await targetDevice.selectConfiguration(config.configurationValue)
            }

            setConnectionStatus(`Successfully connected to ${device.name}. Analyzing device...`)

            try {
                // Now analyze the opened device
                const details = await DeviceDetector.getDeviceDetails(
                    convertToDeviceDetectorFormat(targetDevice)
                )

                setDeviceDetails((prev) => new Map(prev.set(device.id, details)))

                setConnectionStatus(
                    `Connected to ${device.name} in ${details.currentMode?.name || 'Unknown'} mode. ` +
                        `Capabilities: ${
                            [
                                details.adbEnabled ? 'ADB' : null,
                                details.fastbootMode ? 'Fastboot' : null,
                                details.mtpEnabled ? 'MTP' : null,
                            ]
                                .filter(Boolean)
                                .join(', ') || 'None detected'
                        }`
                )
            } catch (analysisError) {
                logWarning('Device analysis failed:', analysisError)
                setConnectionStatus(`Connected to ${device.name}, but detailed analysis failed`)
            }

            await scanForDevices() // Refresh device list
        } catch (err) {
            logWarning('Connection error:', err)
            setConnectionStatus(
                `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleDisconnect = async (device: USBDeviceInfo) => {
        if (!device.vendorId || !device.productId) return

        try {
            setConnectionStatus(`Disconnecting from ${device.name}...`)

            if (!navigator.usb) {
                setConnectionStatus('Web USB API not supported')

                return
            }
            const usbDevices = await navigator.usb.getDevices()
            const targetDevice = usbDevices.find(
                (d: USBDevice) => d.vendorId === device.vendorId && d.productId === device.productId
            )

            if (targetDevice && targetDevice.opened) {
                await targetDevice.close()
            }

            setConnectionStatus(`Disconnected from ${device.name}`)

            setDeviceDetails((prev) => {
                const newMap = new Map(prev)

                newMap.delete(device.id)

                return newMap
            })

            await scanForDevices() // Refresh device list
        } catch (err) {
            logWarning('Disconnect error:', err)
            setConnectionStatus(
                `Disconnect error: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
        }
    }

    const analyzeAllDevices = useCallback(async () => {
        if (!navigator.usb) return

        setIsAnalyzing(true)
        setConnectionStatus('Analyzing all connected devices...')

        try {
            const usbDevices = await navigator.usb.getDevices()
            const newDetails = new Map<string, DeviceDetails>()

            for (const usbDevice of usbDevices) {
                try {
                    const details = await DeviceDetector.getDeviceDetails(
                        convertToDeviceDetectorFormat(usbDevice)
                    )
                    const deviceId = `usb-${usbDevice.vendorId}-${usbDevice.productId}-${Array.from(usbDevices).indexOf(usbDevice)}`

                    newDetails.set(deviceId, details)
                } catch (err) {
                    logWarning('Failed to analyze device:', err)
                }
            }

            setDeviceDetails(newDetails)
            setConnectionStatus(`Analyzed ${newDetails.size} devices successfully`)
        } catch (err) {
            setConnectionStatus(
                `Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
        } finally {
            setIsAnalyzing(false)
        }
    }, [])

    const handleConnectUSBDevice = async () => {
        try {
            setConnectionStatus('Scanning for USB devices...')
            await requestNewDevice('usb')
            setConnectionStatus('USB device connected successfully')
            setTimeout(analyzeAllDevices, 1000)
        } catch (error) {
            if (error instanceof Error && error.name !== 'NotFoundError') {
                setConnectionStatus(`USB connection failed: ${error.message}`)
            } else {
                setConnectionStatus('No USB device selected')
            }
        }
    }

    const handleConnectSerialDevice = async () => {
        if (!serialAPIAvailable) {
            setConnectionStatus('Serial API is not available in this environment')

            return
        }

        try {
            setConnectionStatus('Scanning for serial devices...')
            const device = await EnhancedSerialDetector.requestNewSerialDevice()

            if (device) {
                setSerialDevices((prev) => [...prev, device])
                setConnectionStatus(
                    `Serial device connected: ${device.deviceInfo ? ('model' in device.deviceInfo ? device.deviceInfo.model : device.deviceInfo.product) : 'Unknown'}`
                )
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'NotFoundError') {
                setConnectionStatus(`Serial connection failed: ${error.message}`)
            } else {
                setConnectionStatus('No serial device selected')
            }
        }
    }

    const scanForSerialDevices = async () => {
        if (!serialAPIAvailable) return

        try {
            const devices = await EnhancedSerialDetector.getAllSerialDevices()

            setSerialDevices(devices)
        } catch (error) {
            logWarning('Serial scan failed:', error)
        }
    }

    const handleAnalyzeSerial = async (device: SerialDeviceDetails) => {
        setIsAnalyzing(true)
        setConnectionStatus(`Analyzing ${device.mode} device...`)

        try {
            const updatedDevice = await EnhancedSerialDetector.analyzeSerialDevice(device.port)

            setSerialDevices((prev) =>
                prev.map((d) => (d.port === device.port ? updatedDevice : d))
            )
            setConnectionStatus(
                `Analysis complete: ${updatedDevice.mode.toUpperCase()} mode detected`
            )
        } catch (error) {
            setConnectionStatus(
                `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Unified handlers for DeviceCard
    const handleUnifiedConnect = (device: SerialDeviceDetails | USBDeviceInfo) => {
        if ('port' in device) {
            // Serial device
            handleConnectSerial(device)
        } else {
            // USB device
            handleConnect(device)
        }
    }

    const handleUnifiedDisconnect = (device: SerialDeviceDetails | USBDeviceInfo) => {
        if ('port' in device) {
            // Serial device
            handleDisconnectSerial(device)
        } else {
            // USB device
            handleDisconnect(device)
        }
    }

    const handleConnectSerial = async (device: SerialDeviceDetails) => {
        setConnectionStatus(`Connected to ${device.mode} device`)
    }

    const handleDisconnectSerial = async (device: SerialDeviceDetails) => {
        setConnectionStatus(`Disconnected from ${device.mode} device`)
    }

    // Convert Web USB device to DeviceDetector compatible format
    const convertToDeviceDetectorFormat = (device: USBDevice): DeviceDetectorUSBDevice => {
        return {
            vendorId: device.vendorId,
            productId: device.productId,
            manufacturerName: device.manufacturerName,
            productName: device.productName,
            serialNumber: device.serialNumber,
            deviceClass: 0, // Default value
            deviceSubclass: 0, // Default value
            deviceProtocol: 0, // Default value
            configurations: device.configurations as DeviceDetectorUSBDevice['configurations'],
        }
    }

    const allDevices = [...devices, ...serialDevices]

    return (
        <main className='flex w-full flex-col gap-4 p-2 md:px-4 2xl:px-[10%]'>
            <div className='flex flex-col items-center gap-6 py-8 text-center'>
                <div className='flex items-center justify-center gap-4'>
                    <div className='bg-card rounded-2xl border p-3'>
                        <Monitor className='text-foreground h-10 w-10' />
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-3'>
                            <h1 className='text-foreground text-4xl font-bold'>Device Manager</h1>
                            <span className='rounded-full border border-yellow-500/30 bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400'>
                                DEV
                            </span>
                        </div>
                    </div>
                </div>
                <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
                    Connect and identify your USB and serial devices with advanced detection
                    capabilities
                </p>
                <p className='mx-auto max-w-2xl text-sm text-yellow-600 opacity-80 dark:text-yellow-400'>
                    ⚠️ This page is actively being developed. Some features may not work as
                    expected.
                </p>

                {/* Status Indicators */}
                {/* <div className='flex items-center gap-6 text-sm'>
                    <div className='flex items-center gap-2'>
                        <div
                            className={`h-2 w-2 rounded-full ${serialAPIAvailable ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        <span className='text-muted-foreground'>
                            Serial API: {serialAPIAvailable ? 'Available' : 'Blocked'}
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-blue-500' />
                        <span className='text-muted-foreground'>USB API: Available</span>
                    </div>
                </div> */}
            </div>

            {!serialAPIAvailable && (
                <Alert className='bg-card mx-auto max-w-2xl border'>
                    <AlertTriangle className='text-muted-foreground h-4 w-4' />
                    <AlertDescription className='text-muted-foreground'>
                        Web Serial API is blocked. Only USB device detection is available.
                    </AlertDescription>
                </Alert>
            )}

            <Card className='bg-card mx-auto max-w-2xl border' shadow='none'>
                <CardBody className='p-6'>
                    <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                        <Button
                            className='flex-1 sm:flex-none'
                            color='primary'
                            size='lg'
                            startContent={<Usb className='h-5 w-5' />}
                            onPress={handleConnectUSBDevice}
                        >
                            MTP Device
                        </Button>

                        {serialAPIAvailable && (
                            <Button
                                className='flex-1 sm:flex-none'
                                color='secondary'
                                size='lg'
                                startContent={<Cable className='h-5 w-5' />}
                                onPress={handleConnectSerialDevice}
                            >
                                Port Device
                            </Button>
                        )}
                    </div>

                    {connectionStatus && (
                        <Alert className='bg-muted/50 mt-6 border'>
                            <AlertCircle className='text-muted-foreground h-4 w-4' />
                            <AlertDescription className='text-muted-foreground'>
                                {connectionStatus}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Loading State */}
                    {isAnalyzing && (
                        <div className='text-muted-foreground mt-4 flex items-center justify-center gap-2 text-sm'>
                            <RefreshCw className='h-4 w-4 animate-spin' />
                            <span>Processing...</span>
                        </div>
                    )}
                </CardBody>
            </Card>

            {error && (
                <Alert className='border-destructive/20 bg-destructive/10 mx-auto max-w-2xl border'>
                    <AlertCircle className='text-destructive h-4 w-4' />
                    <AlertDescription className='text-destructive'>{error}</AlertDescription>
                </Alert>
            )}

            <div className='space-y-6'>
                <div className='flex flex-col items-center gap-4 text-center'>
                    <h2 className='text-foreground text-2xl font-bold'>Connected Devices</h2>
                    <p className='text-muted-foreground'>
                        Manage and identify your connected hardware
                    </p>
                    {/* <Button
                        size='sm'
                        startContent={<RefreshCw className='h-4 w-4' />}
                        variant='light'
                        onPress={async () => {
                            setIsScanning(true)
                            try {
                                await scanForDevices()
                                if (serialAPIAvailable) {
                                    await scanForSerialDevices()
                                }
                            } finally {
                                setIsScanning(false)
                            }
                        }}
                    >
                        Refresh Devices
                    </Button> */}
                </div>

                {allDevices.length === 0 ? (
                    <Card className='bg-card mx-auto max-w-2xl border' shadow='none'>
                        <CardBody className='py-16 text-center'>
                            <div className='bg-muted mx-auto mb-6 w-fit rounded-full p-4'>
                                <Monitor className='text-muted-foreground h-16 w-16' />
                            </div>
                            <h3 className='text-foreground mb-3 text-2xl font-bold'>
                                No devices detected
                            </h3>
                            <p className='text-muted-foreground mx-auto max-w-md'>
                                Connect a USB or serial device to get started. The system will
                                automatically detect and analyze your devices.
                            </p>
                        </CardBody>
                    </Card>
                ) : (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
                        {devices.map((device) => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                deviceDetails={deviceDetails.get(device.id) || null}
                                onConnect={handleUnifiedConnect}
                                onDisconnect={handleUnifiedDisconnect}
                            />
                        ))}

                        {serialDevices.map((device, index) => (
                            <DeviceCard
                                key={`serial-${index}`}
                                device={device}
                                isAnalyzing={isAnalyzing}
                                onAnalyze={handleAnalyzeSerial}
                                onConnect={handleUnifiedConnect}
                                onDisconnect={handleUnifiedDisconnect}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
