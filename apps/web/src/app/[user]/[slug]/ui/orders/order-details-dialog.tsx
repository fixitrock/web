import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { OrderDetails } from './order-details'
import { useOrderStore } from '@/zustand/store/orders'
import { useIsMobile } from '@/hooks/use-mobile'
import {
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerBody,
    DrawerDescription,
    DrawerNested,
} from '@/ui/drawer'

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
        <Modal
            isOpen={isDetailsOpen}
            onClose={closeDetails}
            size='4xl'
            scrollBehavior='inside'
            className='bg-background border shadow-none backdrop-blur'
        >
            <ModalContent>
                <ModalHeader className='flex items-center justify-between'>
                    <p>Order Details</p>
                </ModalHeader>
                <ModalBody>
                    <OrderDetails order={selectedOrder} />
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
