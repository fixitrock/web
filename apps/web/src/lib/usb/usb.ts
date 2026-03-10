import webSerial from './webSerial'
import webUsb from './webUsb'

interface USBFilter {
    vendorId: number
    productId: number
}

interface USBOutTransferResult {
    status: 'ok' | 'stall' | 'babble'
    bytesWritten: number
}

class Usb {
    private usb_worker: webSerial | webUsb | null

    constructor(filter: USBFilter) {
        this.usb_worker = null
        if (navigator.userAgent.includes('Windows')) {
            this.usb_worker = new webSerial([
                {
                    usbVendorId: filter.vendorId,
                    usbProductId: filter.productId,
                },
            ])
        } else {
            this.usb_worker = new webUsb({ vendorId: filter.vendorId, productId: filter.productId })
        }
    }

    async requestDevice(): Promise<boolean> {
        if (!this.usb_worker) {
            throw new Error('USB worker not initialized')
        }

        return await this.usb_worker.requestDevice()
    }

    get last_error(): string {
        if (!this.usb_worker) {
            return 'USB worker not initialized'
        }

        return this.usb_worker.getLastError()
    }

    async connect(): Promise<boolean> {
        if (!this.usb_worker) {
            throw new Error('USB worker not initialized')
        }

        return await this.usb_worker.connect()
    }

    async write(buffer: BufferSource): Promise<void | USBOutTransferResult> {
        if (!this.usb_worker) {
            throw new Error('USB worker not initialized')
        }

        return await this.usb_worker.write(buffer)
    }

    async read(length: number): Promise<Uint8Array | { value: ArrayBufferLike }> {
        if (!this.usb_worker) {
            throw new Error('USB worker not initialized')
        }

        return await this.usb_worker.read(length)
    }

    async disconnect(): Promise<void> {
        if (this.usb_worker) {
            await this.usb_worker.disconnect()
        }
    }
}

export default Usb
