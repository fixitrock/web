'use client'

import { EllipsisVertical, Package } from 'lucide-react'
import { Skeleton } from '@heroui/react'
import { CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from '@/ui/command'
import { useMyOrders } from '@/hooks/tanstack/query'
import { useSearchStore } from '@/zustand/store'
import { useDebounce } from '@/hooks'
import { formatPrice, formatPhone } from '@/lib/utils'
import { MyOrderItem } from '@/types/orders'

export function Orders() {
    const { query } = useSearchStore()
    const debouncedQuery = useDebounce(query)
    const { data, isLoading } = useMyOrders(debouncedQuery)

    return (
        <CommandGroup heading='Order History'>
            {!isLoading && data?.orders?.length === 0 && (
                <CommandEmpty>
                    <div className='flex flex-col items-center justify-center p-6 text-center'>
                        <div className='bg-muted mb-3 rounded-full p-3'>
                            <Package className='text-muted-foreground size-6' />
                        </div>
                        <h3 className='text-sm font-medium'>No orders found</h3>
                        <p className='text-muted-foreground mt-1 max-w-[220px] text-xs'>
                            {query
                                ? 'Try adjusting your search.'
                                : 'Orders will appear once you place or receive orders.'}
                        </p>
                    </div>
                </CommandEmpty>
            )}

            {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                      <CommandItem key={i}>
                          <Skeleton className='h-[38px] w-[56px] rounded-md' />
                          <div className='flex w-full flex-1 flex-col items-start gap-0.5 truncate'>
                              <Skeleton className='h-4 w-32 rounded' />
                              <span className='flex items-center gap-1'>
                                  <Skeleton className='h-3 w-18 rounded' />
                                  •
                                  <Skeleton className='h-3 w-18 rounded' />
                              </span>
                              <Skeleton className='h-2 w-20 rounded' />
                          </div>
                          <CommandShortcut>
                              <Skeleton className='h-6 w-12 rounded' />
                          </CommandShortcut>
                          <CommandShortcut>
                              <Skeleton className='size-8 rounded' />
                          </CommandShortcut>
                      </CommandItem>
                  ))
                : data?.orders?.map((order: MyOrderItem) => {
                      const firstProduct = order.products?.[0]
                      const extraCount = order.products.length > 1 ? order.products.length - 1 : 0
                      return (
                          <CommandItem key={order.id}>
                              <div className='bg-default/5 rounded-md border border-dashed px-1.5 py-2'>
                                  <span className='font-mono text-sm font-semibold'>
                                      #{order.id.slice(-4)}
                                  </span>
                              </div>

                              <div className='flex w-full flex-1 flex-col items-start truncate'>
                                  <p className='truncate font-medium'>
                                      {firstProduct?.name}
                                      {extraCount > 0 && (
                                          <span className='text-muted-foreground ml-2'>
                                              +{extraCount}
                                          </span>
                                      )}
                                  </p>

                                  <p className='text-muted-foreground truncate text-[10px]'>
                                      {order.name}
                                      {order.phone && ` • ${formatPhone(order.phone)}`}
                                  </p>

                                  <span className='text-muted-foreground text-[9px]'>
                                      {formatTimestamp(order.createdAt)}
                                  </span>
                              </div>

                              <CommandShortcut className='flex text-lg font-semibold tracking-normal'>
                                  {formatPrice(order.totalAmount)}
                              </CommandShortcut>

                              <CommandShortcut className='rounded border p-1.5'>
                                  <EllipsisVertical />
                              </CommandShortcut>
                          </CommandItem>
                      )
                  })}
        </CommandGroup>
    )
}

function formatTimestamp(dateString: string) {
    const date = new Date(dateString)

    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const time = date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })

    return `${day} ${month} ${year} • ${time}`
}
