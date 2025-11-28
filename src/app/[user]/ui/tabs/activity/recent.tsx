"use client"

import { ShoppingBag, Store, } from "lucide-react"
import { Skeleton, Image } from "@heroui/react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/ui/carousel"
import { useRecentOrders } from "@/hooks/tanstack/query"
import { formatPrice } from "@/lib/utils"
import TimeAgo from 'react-timeago'
import { fallback } from "@/config/site"

export function RecentOrders({ username }: { username: string }) {
    const { data, isLoading } = useRecentOrders(username)

    // const getStatusColor = (status: Order["status"]) => {
    //     switch (status) {
    //         case "completed":
    //             return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
    //         case "pending":
    //             return "text-amber-400 bg-amber-400/10 border-amber-400/20"
    //         case "cancelled":
    //             return "text-rose-400 bg-rose-400/10 border-rose-400/20"
    //         case "refunded":
    //             return "text-purple-400 bg-purple-400/10 border-purple-400/20"
    //         default:
    //             return "text-gray-400 bg-gray-400/10 border-gray-400/20"
    //     }
    // }

    const noOrders = !isLoading && (!data || data.length === 0)

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Store className="size-5 text-amber-400" />
                    <h3 className="text-lg font-semibold tracking-tight">
                        Recent Orders
                    </h3>
                </div>
                {!noOrders && (
                    <span className="text-xs text-muted-foreground">Swipe to see more</span>
                )}
            </div>

            {noOrders && (
                 <div className="flex flex-col items-center justify-center p-3 border bg-default/05 rounded-xl">
    <div className="flex items-center justify-center h-12 w-12 rounded-full 
                    bg-muted-foreground/10 text-muted-foreground mb-3">
       <Store className="size-5 text-amber-400" />
    </div>

    <h1 className="text-lg font-semibold text-foreground">
      No recent orders
    </h1>
    <p className="text-sm text-muted-foreground mt-1">
      Data will appear once you have orders.
    </p>
  </div>
                
            )}

            {!noOrders && (
                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="select-none">
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                  <CarouselItem
                                      key={i}
                                      className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                                  >
                                      <div className="group relative overflow-hidden rounded-xl border p-3 backdrop-blur-sm transition-all">
                                          <div className="flex items-start justify-between">
                                              <div className="flex items-center gap-3">
                                                  <Skeleton className="h-12 w-12 rounded-lg" />
                                                  <div className="space-y-1">
                                                      <Skeleton className="h-4 w-24 rounded-lg" />
                                                      <Skeleton className="h-3 w-16 rounded-lg" />
                                                  </div>
                                              </div>
                                          </div>

                                          <div className="flex items-end justify-between">
                                              <Skeleton className="h-4 w-16 rounded-lg" />
                                              <Skeleton className="h-6 w-20 rounded-lg" />
                                          </div>
                                      </div>
                                  </CarouselItem>
                              ))
                            : data?.map((order) => (
                                  <CarouselItem
                                      key={order.id}
                                      className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                                  >
                                      <div className="group relative overflow-hidden rounded-xl border p-3 backdrop-blur-sm transition-all">
                                          <div className="flex items-start justify-between">
                                              <div className="flex items-center gap-3">
                                                <div className='size-12 border shrink-0 rounded-lg bg-background'>
                                                                                    <Image
                                                                                        src={fallback.recentOrder}
                                                                                        alt={order.name}
                                                                                        className='size-full aspect-square rounded-lg object-cover'
                                                                                        removeWrapper
                                                                                    />
                                                                                </div>
                                                 
                                                  <div className="overflow-hidden">
                                                      <p className="truncate font-medium leading-none">
                                                          {order.name}
                                                      </p>
                                                      <p className="truncate text-xs text-muted-foreground">
                                                          <TimeAgo date={order.created_at} />
                                                      </p>
                                                  </div>
                                              </div>
                                          </div>

                                          <div className="flex items-end justify-between">
                                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                  <ShoppingBag className="h-4 w-4" />
                                                  <span>
                                                      {order.item_count} item
                                                      {order.item_count !== 1 ? "s" : ""}
                                                  </span>
                                              </div>
                                              <p className="text-lg font-bold tracking-tight">
                                                  {formatPrice(order.total_amount)}
                                              </p>
                                          </div>
                                      </div>
                                  </CarouselItem>
                              ))}
                    </CarouselContent>
                </Carousel>
            )}
        </div>
    )
}
