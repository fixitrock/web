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

export interface ADBDevice {
    serialNumber: string
    state: 'device' | 'offline' | 'unauthorized' | 'bootloader' | 'recovery'
    product?: string
    model?: string
    device?: string
    transportId?: string
}

export interface FastbootDevice {
    serialNumber: string
    state: 'fastboot' | 'unknown'
    product?: string
    variant?: string
    bootloaderVersion?: string
}

export class ADBFastbootDetector {
    private static readonly ADB_VENDOR_IDS = [
        0x18d1, // Google
        0x04e8, // Samsung
        0x22b8, // Motorola
        0x0bb4, // HTC
        0x12d1, // Huawei
        0x19d2, // ZTE
        0x1004, // LG
        0x0502, // Acer
        0x413c, // Dell
        0x0489, // Foxconn
        0x04dd, // Sharp
        0x0fce, // Sony Ericsson
        0x091e, // Garmin
        0x18d1, // Asus
        0x109b, // Hisense
        0x1ebf, // Coolpad
        0x17ef, // Lenovo
        0x2717, // Xiaomi
        0x2a45, // Meizu
        0x1bbb, // T-Mobile
    ]

    static isADBFastbootDevice(vendorId: number, _productId: number): boolean {
        return this.ADB_VENDOR_IDS.includes(vendorId)
    }

    static async detectDeviceMode(port: SerialPort): Promise<'adb' | 'fastboot' | 'unknown'> {
        try {
            // Try to detect ADB first
            const adbResult = await this.tryADBCommunication(port)

            if (adbResult) return 'adb'

            // Try fastboot
            const fastbootResult = await this.tryFastbootCommunication(port)

            if (fastbootResult) return 'fastboot'

            return 'unknown'
        } catch (err) {
            return 'unknown'
        }
    }

    private static async tryADBCommunication(port: SerialPort): Promise<boolean> {
        try {
            if (!port.readable || !port.writable) return false

            const writer = port.writable.getWriter()
            const reader = port.readable.getReader()

            try {
                // Send ADB host:version command
                const adbCommand = new TextEncoder().encode('host:version\n')

                await writer.write(adbCommand)

                // Wait for response with timeout
                const response = (await Promise.race([
                    reader.read(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), 2000)
                    ),
                ])) as ReadableStreamReadResult<Uint8Array>

                if (response.value) {
                    const responseText = new TextDecoder().decode(response.value)

                    return responseText.includes('OKAY') || responseText.includes('host')
                }

                return false
            } finally {
                writer.releaseLock()
                reader.releaseLock()
            }
        } catch (err) {
            return false
        }
    }

    private static async tryFastbootCommunication(port: SerialPort): Promise<boolean> {
        try {
            if (!port.readable || !port.writable) return false

            const writer = port.writable.getWriter()
            const reader = port.readable.getReader()

            try {
                // Send fastboot getvar version command
                const fastbootCommand = new TextEncoder().encode('getvar:version\n')

                await writer.write(fastbootCommand)

                // Wait for response with timeout
                const response = (await Promise.race([
                    reader.read(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), 2000)
                    ),
                ])) as ReadableStreamReadResult<Uint8Array>

                if (response.value) {
                    const responseText = new TextDecoder().decode(response.value)

                    return responseText.includes('OKAY') || responseText.includes('fastboot')
                }

                return false
            } finally {
                writer.releaseLock()
                reader.releaseLock()
            }
        } catch (_error) {
            return false
        }
    }

    static async getADBDeviceInfo(port: SerialPort): Promise<ADBDevice | null> {
        try {
            if (!port.readable || !port.writable) return null

            const writer = port.writable.getWriter()
            const reader = port.readable.getReader()

            try {
                const deviceInfo: Partial<ADBDevice> = {
                    state: 'device',
                    serialNumber: 'unknown',
                }

                // Get device properties
                const commands = [
                    'shell:getprop ro.product.model',
                    'shell:getprop ro.product.device',
                    'shell:getprop ro.serialno',
                    'shell:getprop ro.product.name',
                ]

                for (const command of commands) {
                    try {
                        await writer.write(new TextEncoder().encode(command + '\n'))

                        const response = (await Promise.race([
                            reader.read(),
                            new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Timeout')), 3000)
                            ),
                        ])) as ReadableStreamReadResult<Uint8Array>

                        if (response.value) {
                            const responseText = new TextDecoder().decode(response.value).trim()

                            if (command.includes('ro.product.model')) {
                                deviceInfo.model = responseText.replace('OKAY', '').trim()
                            } else if (command.includes('ro.product.device')) {
                                deviceInfo.device = responseText.replace('OKAY', '').trim()
                            } else if (command.includes('ro.serialno')) {
                                deviceInfo.serialNumber = responseText.replace('OKAY', '').trim()
                            } else if (command.includes('ro.product.name')) {
                                deviceInfo.product = responseText.replace('OKAY', '').trim()
                            }
                        }
                    } catch (_cmdError) {
                        // Failed to execute command, continue with next command
                    }
                }

                return deviceInfo as ADBDevice
            } finally {
                writer.releaseLock()
                reader.releaseLock()
            }
        } catch (_error) {
            // Failed to get ADB device info
            return null
        }
    }

    static async getFastbootDeviceInfo(port: SerialPort): Promise<FastbootDevice | null> {
        try {
            if (!port.readable || !port.writable) return null

            const writer = port.writable.getWriter()
            const reader = port.readable.getReader()

            try {
                const deviceInfo: Partial<FastbootDevice> = {
                    state: 'fastboot',
                    serialNumber: 'unknown',
                }

                // Get fastboot variables
                const commands = [
                    'getvar:serialno',
                    'getvar:product',
                    'getvar:variant',
                    'getvar:version-bootloader',
                ]

                for (const command of commands) {
                    try {
                        await writer.write(new TextEncoder().encode(command + '\n'))

                        const response = (await Promise.race([
                            reader.read(),
                            new Promise((_, reject) =>
                                setTimeout(() => reject(new Error('Timeout')), 3000)
                            ),
                        ])) as ReadableStreamReadResult<Uint8Array>

                        if (response.value) {
                            const responseText = new TextDecoder().decode(response.value).trim()

                            if (command.includes('serialno')) {
                                deviceInfo.serialNumber = responseText.replace('OKAY', '').trim()
                            } else if (command.includes('product')) {
                                deviceInfo.product = responseText.replace('OKAY', '').trim()
                            } else if (command.includes('variant')) {
                                deviceInfo.variant = responseText.replace('OKAY', '').trim()
                            } else if (command.includes('version-bootloader')) {
                                deviceInfo.bootloaderVersion = responseText
                                    .replace('OKAY', '')
                                    .trim()
                            }
                        }
                    } catch (_cmdError) {
                        // Failed to execute fastboot command, continue with next command
                    }
                }

                return deviceInfo as FastbootDevice
            } finally {
                writer.releaseLock()
                reader.releaseLock()
            }
        } catch (_error) {
            // Failed to get Fastboot device info
            return null
        }
    }
}
