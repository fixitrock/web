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

interface SerialPortFilter {
    usbVendorId?: number
    usbProductId?: number
}

interface NavigatorSerial {
    requestPort(filters?: SerialPortFilter[]): Promise<SerialPort>
    getPorts(): Promise<SerialPort[]>
}

declare global {
    interface Navigator {
        serial?: NavigatorSerial
    }
}

class webSerial {
    private usb_device: SerialPort | null
    private filter: SerialPortFilter[]
    private last_error: string

    constructor(filter: SerialPortFilter[]) {
        this.usb_device = null
        this.filter = filter
        this.last_error = ''
    }

    async requestDevice(): Promise<boolean> {
        if (window.navigator.serial === undefined) {
            this.last_error = 'Unsupported browser / os'

            return false
        }

        try {
            this.usb_device = await window.navigator.serial!.requestPort()

            return true
        } catch (e) {
            const error = e as Error

            this.last_error = error.message
        }

        return false
    }

    async connect(): Promise<boolean> {
        if (!this.usb_device) {
            this.last_error = 'No serial device selected'

            return false
        }

        try {
            await this.usb_device.open({
                baudRate: 115200,
                parity: 'none',
                dataBits: 8,
                stopBits: 1,
            })

            return true
        } catch (e) {
            const error = e as Error

            this.last_error = error.message
        }

        return false
    }

    async write(buffer: BufferSource): Promise<void> {
        if (!this.usb_device || !this.usb_device.writable) {
            throw new Error('Device not connected or not writable')
        }

        const data_writer = this.usb_device.writable.getWriter()

        try {
            return await data_writer.write(new Uint8Array(buffer as ArrayBuffer))
        } finally {
            data_writer.releaseLock()
        }
    }

    async read(_length: number): Promise<Uint8Array> {
        if (!this.usb_device || !this.usb_device.readable) {
            throw new Error('Device not connected or not readable')
        }

        const data_reader = this.usb_device.readable.getReader()

        try {
            const result = await data_reader.read()

            return result.value || new Uint8Array(0)
        } finally {
            data_reader.releaseLock()
        }
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
        return this.usb_device !== null
    }
}

export default webSerial
