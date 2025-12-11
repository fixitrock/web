'use client'

import { Package, Eye, RotateCw } from 'lucide-react'
import { Skeleton, Button } from '@heroui/react'
import { useSellerOrders } from '@/hooks/tanstack/query'
import { formatPrice, formatPhone, cn } from '@/lib/utils'
import { CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from '@/ui/command'
import { Order } from '@/types/orders'
import { useSearchStore } from '@/zustand/store'
import { useDebounce } from '@/hooks'
import { useOrderStore } from '@/zustand/store/orders'
import { OrderDetailsDialog } from '@/app/[user]/[slug]/ui/orders/order-details-dialog'
import { ReturnOrder } from '@/app/[user]/[slug]/ui/orders/return'

export function Orders() {
    const { query } = useSearchStore()
    const debouncedQuery = useDebounce(query)
    const { data, isLoading } = useSellerOrders(debouncedQuery)
    const { openDetails, openReturn } = useOrderStore()

    const getStatusBadge = (order: Order) => {
        const badgeConfig =
            order.orderReturnType === 'full' || order.isFullyReturned
                ? { label: 'Returned', color: 'red' }
                : order.orderReturnType === 'partial'
                  ? { label: 'Partial', color: 'yellow' }
                  : { label: 'Delivered', color: 'green' }

        const colorClasses: Record<string, string> = {
            green: 'bg-green-500/10 text-green-500 border-green-500/10',
            yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10',
            red: 'bg-red-500/10 text-red-500 border-red-500/10',
        }

        return (
            <div
                className={cn(
                    'rounded-lg border px-2 py-0.5 text-[10px] font-medium',
                    colorClasses[badgeConfig.color]
                )}
            >
                {badgeConfig.label}
            </div>
        )
    }

    return (
        <>
            <CommandGroup heading='Order History'>
                {data?.orders?.length === 0 && (
                    <CommandEmpty>
                        <div className='flex flex-col items-center justify-center p-6 text-center'>
                            <div className='bg-muted mb-3 flex items-center justify-center rounded-full p-3'>
                                <Package className='text-muted-foreground size-6' />
                            </div>
                            <h3 className='text-foreground text-sm font-medium'>No orders found</h3>
                            <p className='text-muted-foreground mt-1 max-w-[200px] text-xs'>
                                {query
                                    ? 'Try adjusting your search terms.'
                                    : 'Orders will appear here once you make sales.'}
                            </p>
                        </div>
                    </CommandEmpty>
                )}

                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                          <CommandItem key={i} className='border-b p-2 last:border-b-0'>
                              <div className='flex w-full items-center justify-between'>
                                  <div className='flex items-center gap-3'>
                                      <Skeleton className='size-10 rounded-md' />
                                      <div className='space-y-1.5'>
                                          <Skeleton className='h-3 w-24 rounded' />
                                          <Skeleton className='h-2.5 w-16 rounded' />
                                      </div>
                                  </div>
                                  <Skeleton className='h-5 w-16 rounded' />
                              </div>
                          </CommandItem>
                      ))
                    : data?.orders?.map((order) => (
                          <CommandItem key={order.id}>
                              <div className='flex w-full flex-1 flex-col items-start truncate'>
                                  <p className='font-mono font-bold tracking-tight'>#{order.id}</p>
                                  <p className='text-muted-foreground text-[10px]'>
                                      {order.userName} • {formatPhone(order.userPhone)}
                                  </p>
                                  <span className='text-muted-foreground text-[9px]'>
                                      {formatTimestamp(order.createdAt || '')}
                                  </span>
                              </div>
                              <div className='flex flex-col items-center'>
                                  <p className='text-muted-foreground'>
                                      {formatPrice(order.totalAmount)}
                                  </p>
                                  {getStatusBadge(order)}
                              </div>

                              <CommandShortcut>
                                  <Button
                                      fullWidth
                                      variant='light'
                                      size='sm'
                                      isIconOnly
                                      onPress={() => openReturn(order)}
                                  >
                                      <RotateCw className='text-warning' />
                                  </Button>
                                  <Button
                                      fullWidth
                                      variant='light'
                                      size='sm'
                                      onPress={() => openDetails(order)}
                                      isIconOnly
                                  >
                                      <Eye className='text-primary' />
                                  </Button>
                              </CommandShortcut>
                          </CommandItem>
                      ))}
            </CommandGroup>
            <OrderDetailsDialog />
            <ReturnOrder />
        </>
    )
}

function formatTimestamp(dateString: string) {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const time = date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

    return `${day} ${month} ${year} • ${time}`
}
