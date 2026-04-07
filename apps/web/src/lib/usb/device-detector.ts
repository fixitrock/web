// Web USB API types
interface USBDevice {
    vendorId: number
    productId: number
    manufacturerName?: string
    productName?: string
    serialNumber?: string
    deviceClass?: number
    deviceSubclass?: number
    deviceProtocol?: number
    configurations: USBConfiguration[]
}

interface USBConfiguration {
    configurationValue: number
    configurationName?: string
    interfaces: USBInterface[]
}

interface USBInterface {
    interfaceNumber: number
    alternate: USBAlternateInterface
    alternates: USBAlternateInterface[]
}

interface USBAlternateInterface {
    interfaceClass: number
    interfaceSubclass?: number
    interfaceProtocol?: number
    interfaceName?: string
    endpoints: USBEndpoint[]
}

interface USBEndpoint {
    endpointNumber: number
    direction: 'in' | 'out'
    type: 'bulk' | 'interrupt' | 'isochronous' | 'control'
    packetSize: number
}

// Device detection and connection mode utilities
export interface DeviceDetails {
    vendorId: number
    productId: number
    manufacturer?: string
    product?: string
    serialNumber?: string
    deviceClass?: number
    deviceSubclass?: number
    deviceProtocol?: number
    configurations?: USBConfiguration[]
    connectionModes: ConnectionMode[]
    currentMode?: ConnectionMode
    adbEnabled?: boolean
    fastbootMode?: boolean
    mtpEnabled?: boolean
}

export interface ConnectionMode {
    name: string
    type: 'adb' | 'fastboot' | 'mtp' | 'mass_storage' | 'charging' | 'unknown'
    description: string
    available: boolean
}

// Common Android device vendor IDs
const ANDROID_VENDORS = {
    6353: 'Google',
    1256: 'Samsung',
    8888: 'Motorola',
    2996: 'HTC',
    4817: 'Huawei',
    6610: 'ZTE',
    4100: 'LG',
    1282: 'Acer',
    2821: 'ASUS',
    16700: 'Dell',
    1161: 'Foxconn',
    1245: 'Sharp',
    4046: 'Sony Ericsson',
    9024: 'Norelsys',
}

// Known product IDs for different modes
const DEVICE_MODES = {
    // ADB mode
    ADB: [0x4ee1, 0x4ee2, 0x4ee5, 0x4ee6, 0x4ee7],
    // Fastboot mode
    FASTBOOT: [0x4ee0, 0xd00d],
    // MTP mode
    MTP: [0x4ee1, 0x4ee2, 0x6860, 0x6863, 0x6864],
    // Mass storage
    MASS_STORAGE: [0x4e11, 0x4e12, 0x4e21, 0x4e22],
}

export class DeviceDetector {
    static async getDeviceDetails(device: USBDevice): Promise<DeviceDetails> {
        if (!device) {
            throw new Error('Device is null or undefined')
        }

        const details: DeviceDetails = {
            vendorId: device.vendorId,
            productId: device.productId,
            manufacturer: device.manufacturerName,
            product: device.productName,
            serialNumber: device.serialNumber,
            deviceClass: device.deviceClass,
            deviceSubclass: device.deviceSubclass,
            deviceProtocol: device.deviceProtocol,
            configurations: device.configurations,
            connectionModes: [],
        }

        try {
            // Detect connection modes
            details.connectionModes = this.detectConnectionModes(device)
            details.currentMode = this.getCurrentMode(device)

            // Check for specific capabilities
            details.adbEnabled = this.isADBEnabled(device)
            details.fastbootMode = this.isFastbootMode(device)
            details.mtpEnabled = this.isMTPEnabled(device)
        } catch (_error) {
            // Error during device analysis
            // Provide basic fallback information
            details.connectionModes = [
                {
                    name: 'Generic USB',
                    type: 'unknown',
                    description: 'Standard USB device',
                    available: true,
                },
            ]
            details.currentMode = details.connectionModes[0]
        }

        return details
    }

    static detectConnectionModes(device: USBDevice): ConnectionMode[] {
        const modes: ConnectionMode[] = []
        const { vendorId, productId } = device

        // Check if it's an Android device
        const isAndroid = vendorId in ANDROID_VENDORS

        if (isAndroid) {
            // ADB mode detection
            modes.push({
                name: 'ADB (Android Debug Bridge)',
                type: 'adb',
                description: 'Debug and development mode',
                available: DEVICE_MODES.ADB.includes(productId) || this.hasADBInterface(device),
            })

            // Fastboot mode detection
            modes.push({
                name: 'Fastboot',
                type: 'fastboot',
                description: 'Bootloader mode for flashing',
                available:
                    DEVICE_MODES.FASTBOOT.includes(productId) || this.hasFastbootInterface(device),
            })

            // MTP mode detection
            modes.push({
                name: 'MTP (Media Transfer Protocol)',
                type: 'mtp',
                description: 'File transfer mode',
                available: DEVICE_MODES.MTP.includes(productId) || this.hasMTPInterface(device),
            })

            // Mass storage mode
            modes.push({
                name: 'Mass Storage',
                type: 'mass_storage',
                description: 'USB storage mode',
                available:
                    DEVICE_MODES.MASS_STORAGE.includes(productId) ||
                    this.hasMassStorageInterface(device),
            })
        }

        // Generic USB device
        if (modes.length === 0) {
            modes.push({
                name: 'Generic USB',
                type: 'unknown',
                description: 'Standard USB device',
                available: true,
            })
        }

        return modes
    }

    static getCurrentMode(device: USBDevice): ConnectionMode | undefined {
        const modes = this.detectConnectionModes(device)

        return modes.find((mode) => mode.available) || modes[0]
    }

    static isADBEnabled(device: USBDevice): boolean {
        return DEVICE_MODES.ADB.includes(device.productId) || this.hasADBInterface(device)
    }

    static isFastbootMode(device: USBDevice): boolean {
        return DEVICE_MODES.FASTBOOT.includes(device.productId) || this.hasFastbootInterface(device)
    }

    static isMTPEnabled(device: USBDevice): boolean {
        return DEVICE_MODES.MTP.includes(device.productId) || this.hasMTPInterface(device)
    }

    private static hasADBInterface(device: USBDevice): boolean {
        return (
            device.configurations?.some((config) =>
                config.interfaces.some((iface) =>
                    iface.alternates.some(
                        (alt) =>
                            alt.interfaceClass === 0xff && // Vendor specific
                            alt.interfaceSubclass === 0x42 && // ADB subclass
                            alt.interfaceProtocol === 0x01
                    )
                )
            ) || false
        )
    }

    private static hasFastbootInterface(device: USBDevice): boolean {
        return (
            device.configurations?.some((config) =>
                config.interfaces.some((iface) =>
                    iface.alternates.some(
                        (alt) =>
                            alt.interfaceClass === 0xff && // Vendor specific
                            alt.interfaceSubclass === 0x42 && // Fastboot subclass
                            alt.interfaceProtocol === 0x03
                    )
                )
            ) || false
        )
    }

    private static hasMTPInterface(device: USBDevice): boolean {
        return (
            device.configurations?.some((config) =>
                config.interfaces.some((iface) =>
                    iface.alternates.some(
                        (alt) =>
                            alt.interfaceClass === 0x06 && // Still Image class
                            alt.interfaceSubclass === 0x01 && // MTP subclass
                            alt.interfaceProtocol === 0x01
                    )
                )
            ) || false
        )
    }

    private static hasMassStorageInterface(device: USBDevice): boolean {
        return (
            device.configurations?.some((config) =>
                config.interfaces.some((iface) =>
                    iface.alternates.some(
                        (alt) =>
                            alt.interfaceClass === 0x08 && // Mass Storage class
                            alt.interfaceSubclass === 0x06 && // SCSI subclass
                            alt.interfaceProtocol === 0x50 // Bulk-only protocol
                    )
                )
            ) || false
        )
    }

    static getVendorName(vendorId: number): string {
        return (
            ANDROID_VENDORS[vendorId as keyof typeof ANDROID_VENDORS] ||
            `Unknown (0x${vendorId.toString(16)})`
        )
    }
}
