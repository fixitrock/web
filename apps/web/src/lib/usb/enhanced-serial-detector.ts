import { ADBFastbootDetector, type ADBDevice, type FastbootDevice } from './adb-fastboot-detector'

export type { ADBDevice, FastbootDevice } from './adb-fastboot-detector'

// Web Serial API types
interface SerialPort {
    readable: ReadableStream<Uint8Array> | null
    writable: WritableStream<Uint8Array> | null
    open(options: SerialOptions): Promise<void>
    close(): Promise<void>
    getInfo(): SerialPortInfo
}

interface SerialOptions {
    baudRate: number
    dataBits?: number
    stopBits?: number
    parity?: 'none' | 'even' | 'odd'
    bufferSize?: number
    flowControl?: 'none' | 'hardware'
}

interface SerialPortInfo {
    usbVendorId?: number
    usbProductId?: number
}

interface NavigatorSerial {
    requestPort(filters?: SerialPortFilter[]): Promise<SerialPort>
    getPorts(): Promise<SerialPort[]>
}

interface SerialPortFilter {
    usbVendorId?: number
    usbProductId?: number
}

declare global {
    interface Navigator {
        serial?: NavigatorSerial
    }
}

export interface SerialDeviceDetails {
    port: SerialPort
    mode: 'adb' | 'fastboot' | 'generic' | 'unknown'
    deviceInfo?: ADBDevice | FastbootDevice
    portInfo: {
        usbVendorId?: number
        usbProductId?: number
    }
    capabilities: string[]
    connectionTime: Date
}

export class EnhancedSerialDetector {
    private static connectedDevices = new Map<SerialPort, SerialDeviceDetails>()
    private static _serialAPIChecked = false
    private static _serialAPIAvailable = false

    static isSerialAPIAvailable(): boolean {
        if (!this._serialAPIChecked) {
            try {
                this._serialAPIAvailable =
                    typeof navigator !== 'undefined' &&
                    'serial' in navigator &&
                    !!navigator.serial &&
                    typeof navigator.serial.getPorts === 'function'

                // Test if we can actually access the API without permissions error
                if (this._serialAPIAvailable && navigator.serial) {
                    // Try a simple call to see if permissions policy allows it
                    navigator.serial.getPorts().catch((error) => {
                        if (error.message.includes('permissions policy')) {
                            this._serialAPIAvailable = false
                        }
                    })
                }
            } catch (_error) {
                this._serialAPIAvailable = false
            }
            this._serialAPIChecked = true
        }

        return this._serialAPIAvailable
    }

    static async analyzeSerialDevice(port: SerialPort): Promise<SerialDeviceDetails> {
        const portInfo = port.getInfo()
        const details: SerialDeviceDetails = {
            port,
            mode: 'unknown',
            portInfo: {
                usbVendorId: portInfo.usbVendorId,
                usbProductId: portInfo.usbProductId,
            },
            capabilities: [],
            connectionTime: new Date(),
        }

        try {
            // Check if this looks like an Android device
            if (
                portInfo.usbVendorId &&
                ADBFastbootDetector.isADBFastbootDevice(
                    portInfo.usbVendorId,
                    portInfo.usbProductId || 0
                )
            ) {
                // Try to open the port for communication
                if (!port.readable) {
                    await port.open({
                        baudRate: 115200,
                        parity: 'none',
                        dataBits: 8,
                        stopBits: 1,
                    })
                }

                // Detect the specific mode
                const detectedMode = await ADBFastbootDetector.detectDeviceMode(port)

                details.mode = detectedMode

                // Get device-specific information
                if (detectedMode === 'adb') {
                    details.capabilities.push('ADB Debug', 'Shell Access', 'App Installation')
                    const adbInfo = await ADBFastbootDetector.getADBDeviceInfo(port)

                    if (adbInfo) {
                        details.deviceInfo = adbInfo
                    }
                } else if (detectedMode === 'fastboot') {
                    details.capabilities.push('Fastboot', 'Bootloader Access', 'Firmware Flash')
                    const fastbootInfo = await ADBFastbootDetector.getFastbootDeviceInfo(port)

                    if (fastbootInfo) {
                        details.deviceInfo = fastbootInfo
                    }
                }
            } else {
                details.mode = 'generic'
                details.capabilities.push('Serial Communication')
            }

            this.connectedDevices.set(port, details)

            return details
        } catch (_error) {
            // Serial device analysis failed
            details.mode = 'unknown'

            return details
        }
    }

    static async getAllSerialDevices(): Promise<SerialDeviceDetails[]> {
        if (!this.isSerialAPIAvailable()) {
            return []
        }

        try {
            const ports = await navigator.serial!.getPorts()
            const deviceDetails: SerialDeviceDetails[] = []

            for (const port of ports) {
                let details = this.connectedDevices.get(port)

                if (!details) {
                    details = await this.analyzeSerialDevice(port)
                }
                deviceDetails.push(details)
            }

            return deviceDetails
        } catch (error) {
            if (error instanceof Error && error.message.includes('permissions policy')) {
                this._serialAPIAvailable = false
                // Serial API blocked by permissions policy

                return []
            }
            // Failed to get serial devices

            return []
        }
    }

    static async requestNewSerialDevice(): Promise<SerialDeviceDetails | null> {
        if (!this.isSerialAPIAvailable()) {
            throw new Error(
                'Web Serial API is not available. Please use a supported browser with HTTPS.'
            )
        }

        try {
            const port = await navigator.serial!.requestPort()

            return await this.analyzeSerialDevice(port)
        } catch (_error) {
            // Failed to request serial device

            return null
        }
    }

    static getDeviceDetails(port: SerialPort): SerialDeviceDetails | null {
        return this.connectedDevices.get(port) || null
    }

    static removeDevice(port: SerialPort): void {
        this.connectedDevices.delete(port)
    }
}
