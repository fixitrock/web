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
    open(): Promise<void>
    close(): Promise<void>
    selectConfiguration(configurationValue: number): Promise<void>
    claimInterface(interfaceNumber: number): Promise<void>
    transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>
    transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>
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

interface USBOutTransferResult {
    status: 'ok' | 'stall' | 'babble'
    bytesWritten: number
}

interface USBInTransferResult {
    status: 'ok' | 'stall' | 'babble'
    data: DataView
}

interface USBDeviceFilter {
    vendorId?: number
    productId?: number
    classCode?: number
    subclassCode?: number
    protocolCode?: number
    serialNumber?: string
}

interface USBDeviceRequestOptions {
    filters: USBDeviceFilter[]
}

interface NavigatorUSB {
    requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>
}

interface Navigator {
    usb?: NavigatorUSB
}

class webUsb {
    private usb_device: USBDevice | null
    private filter: USBDeviceFilter[]
    private ep_in: number | null
    private ep_out: number | null
    private last_error: string

    constructor(filter: USBDeviceFilter) {
        this.usb_device = null
        this.filter = [filter]
        this.ep_in = null
        this.ep_out = null
        this.last_error = ''
    }

    async requestDevice(): Promise<boolean> {
        if (!(window.navigator as Navigator).usb) {
            this.last_error = 'Unsupported browser / os'

            return false
        }

        try {
            this.usb_device = await (window.navigator as Navigator).usb!.requestDevice({
                filters: this.filter,
            })

            return true
        } catch (e) {
            const error = e as Error

            this.last_error = error.message
        }

        return false
    }

    async claimInterface(): Promise<boolean> {
        if (!this.usb_device) {
            this.last_error = 'No USB device selected'

            return false
        }

        const find_device = () => {
            for (const i in this.usb_device!.configurations) {
                const config = this.usb_device!.configurations[i]

                for (const j in config.interfaces) {
                    const interfaces = config.interfaces[j]

                    for (const k in interfaces.alternates) {
                        const alternates = interfaces.alternates[k]

                        if (alternates.interfaceClass === 255) {
                            return { config: config, interface: interfaces, alternates: alternates }
                        }
                    }
                }
            }

            return null
        }

        const get_ep_number = (
            endpoints: USBEndpoint[],
            dir: 'in' | 'out',
            type: string = 'bulk'
        ): number => {
            let e: string, ep: USBEndpoint

            for (e in endpoints) {
                ep = endpoints[e]
                if (ep.direction === dir && ep.type === type) return ep.endpointNumber
            }
            throw new Error('Cannot find ' + dir + ' endpoint')
        }

        const match = find_device()

        if (match === null) {
            this.last_error = 'Endpoint match not found'

            return false
        }

        await this.usb_device.selectConfiguration(match.config.configurationValue)
        await this.usb_device.claimInterface(match.interface.interfaceNumber)

        this.ep_in = get_ep_number(match.alternates.endpoints, 'in')
        this.ep_out = get_ep_number(match.alternates.endpoints, 'out')

        return true
    }

    async connect(): Promise<boolean> {
        if (!this.usb_device) {
            this.last_error = 'No USB device selected'

            return false
        }

        try {
            await this.usb_device.open()

            return await this.claimInterface()
        } catch (e) {
            const error = e as Error

            this.last_error = error.message
        }

        return false
    }

    async write(buffer: BufferSource): Promise<USBOutTransferResult> {
        if (!this.usb_device || this.ep_out === null) {
            throw new Error('Device not connected or endpoint not configured')
        }

        return await this.usb_device.transferOut(this.ep_out, buffer)
    }

    async read(length: number): Promise<{ value: ArrayBufferLike }> {
        if (!this.usb_device || this.ep_in === null) {
            throw new Error('Device not connected or endpoint not configured')
        }
        const buffer = await this.usb_device.transferIn(this.ep_in, length)

        return { value: buffer.data.buffer }
    }

    async disconnect(): Promise<void> {
        if (this.usb_device) {
            await this.usb_device.close()
        }
    }

    getLastError(): string {
        return this.last_error
    }

    isConnected(): boolean {
        return this.usb_device !== null && this.ep_in !== null && this.ep_out !== null
    }
}

export default webUsb
