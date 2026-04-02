import { Modal } from '@heroui/react'

import { useIsMobile } from '@/hooks/use-mobile'
import { useOrderStore } from '@/zustand/store/orders'
import {
    DrawerBody,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerNested,
    DrawerTitle,
} from '@/ui/drawer'

import { OrderDetails } from './order-details'

export function OrderDetailsDialog() {
    const { selectedOrder, isDetailsOpen, closeDetails } = useOrderStore()
    const isMobile = useIsMobile()

    if (!selectedOrder) return null

    if (isMobile) {
        return (
            <DrawerNested open={isDetailsOpen} onOpenChange={(open) => !open && closeDetails()}>
                <DrawerContent className='h-[80vh]'>
                    <DrawerHeader hidden>
                        <DrawerTitle aria-hidden hidden />
                        <DrawerDescription aria-hidden hidden />
                    </DrawerHeader>
                    <DrawerBody className='px-4 py-0'>
                        <OrderDetails order={selectedOrder} />
                    </DrawerBody>
                </DrawerContent>
            </DrawerNested>
        )
    }

    return (
        <Modal>
            <Modal.Backdrop isOpen={isDetailsOpen} variant='blur' onOpenChange={(open) => !open && closeDetails()}>
                <Modal.Container
                    className='rounded-[20px] border bg-background/95 backdrop-blur'
                    scroll='inside'
                    size='full'
                >
                    <Modal.Dialog>
                        <Modal.Header className='items-center justify-between border-b'>
                            <Modal.Heading>Order Details</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <OrderDetails order={selectedOrder} />
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    )
}
