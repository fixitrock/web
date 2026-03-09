'use client'

import { useState, useEffect, useCallback } from 'react'

// Web USB API types
interface USBDevice {
    vendorId: number
    productId: number
    manufacturerName?: string
    productName?: string
    serialNumber?: string
    opened: boolean
}

interface NavigatorUSB {
    getDevices(): Promise<USBDevice[]>
    requestDevice(options: { filters: USBDeviceFilter[] }): Promise<USBDevice>
}

interface USBDeviceFilter {
    vendorId?: number
    productId?: number
    classCode?: number
    subclassCode?: number
    protocolCode?: number
    serialNumber?: string
}

// Web Serial API types
interface SerialPort {
    getInfo(): { usbVendorId?: number; usbProductId?: number }
    readable: ReadableStream<Uint8Array> | null
}

interface NavigatorSerial {
    getPorts(): Promise<SerialPort[]>
    requestPort(): Promise<SerialPort>
}

interface Navigator {
    usb?: NavigatorUSB
    serial?: NavigatorSerial
}

export interface USBDeviceInfo {
    id: string
    name: string
    vendorId?: number
    productId?: number
    manufacturer?: string
    product?: string
    serialNumber?: string
    connected: boolean
    type: 'usb' | 'serial'
}

export function useUSBDevices() {
    const [devices, setDevices] = useState<USBDeviceInfo[]>([])
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const scanForDevices = useCallback(async () => {
        setIsScanning(true)
        setError(null)

        try {
            const foundDevices: USBDeviceInfo[] = []

            // Check for Web USB API support
            if ((navigator as Navigator).usb) {
                try {
                    const usbDevices = await (navigator as Navigator).usb!.getDevices()

                    usbDevices.forEach((device: USBDevice, index: number) => {
                        foundDevices.push({
                            id: `usb-${device.vendorId}-${device.productId}-${index}`,
                            name: device.productName || `USB Device ${index + 1}`,
                            vendorId: device.vendorId,
                            productId: device.productId,
                            manufacturer: device.manufacturerName,
                            product: device.productName,
                            serialNumber: device.serialNumber,
                            connected: device.opened,
                            type: 'usb',
                        })
                    })
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to scan USB devices')
                }
            }

            // Check for Web Serial API support
            if (navigator.serial) {
                try {
                    const serialPorts = await navigator.serial.getPorts()

                    serialPorts.forEach((port, index) => {
                        const info = port.getInfo()

                        foundDevices.push({
                            id: `serial-${info.usbVendorId || 0}-${info.usbProductId || 0}-${index}`,
                            name: `Serial Port ${index + 1}`,
                            vendorId: info.usbVendorId,
                            productId: info.usbProductId,
                            connected: port.readable !== null,
                            type: 'serial',
                        })
                    })
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to scan serial devices')
                }
            }

            setDevices(foundDevices)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to scan devices')
        } finally {
            setIsScanning(false)
        }
    }, [])

    const requestNewDevice = useCallback(
        async (type: 'usb' | 'serial' = 'usb') => {
            setError(null)

            try {
                if (type === 'usb' && (navigator as Navigator).usb) {
                    const device = await (navigator as Navigator).usb!.requestDevice({
                        filters: [],
                    })

                    await scanForDevices() // Refresh the list

                    return device
                } else if (type === 'serial' && navigator.serial) {
                    const port = await navigator.serial.requestPort()

                    await scanForDevices() // Refresh the list

                    return port
                } else {
                    throw new Error(`${type.toUpperCase()} API not supported`)
                }
            } catch (err) {
                if (err instanceof Error && err.name !== 'NotFoundError') {
                    setError(err.message)
                }
                throw err
            }
        },
        [scanForDevices]
    )

    useEffect(() => {
        scanForDevices()
    }, [scanForDevices])

    return {
        devices,
        isScanning,
        error,
        scanForDevices,
        requestNewDevice,
    }
}
