import { useInfiniteQuery } from '@tanstack/react-query'
import { myTransaction, myTransactions } from '@/actions/user/transactions'
import { queryKeys } from './queryKeys'

export function useMyTransaction(search: string = '') {
    return useInfiniteQuery({
        queryKey: queryKeys.transactionHistorySearch.list(search),
        queryFn: ({ pageParam = 1 }) => myTransaction(search, pageParam as number),

        initialPageParam: 1,

        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),

        select: (data) => {
            const firstPage = data.pages[0]

            return {
                view: firstPage?.view ?? null,
                total: firstPage?.total ?? 0,
                pages: data.pages,
                transactions: data.pages.flatMap((p) => p.transaction),
                hasMore: data.pages.at(-1)?.hasMore ?? false,
            }
        },
        staleTime: 60 * 1000,
    })
}

export function useMyTransactions(userId?: string | null) {
    return useInfiniteQuery({
        queryKey: queryKeys.transactionHistoryByUser.list(userId),
        queryFn: ({ pageParam = 1 }) => myTransactions(userId ?? '', pageParam as number),
        initialPageParam: 1,
        enabled: Boolean(userId),
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
        select: (data) => {
            const firstPage = data.pages[0]

            return {
                seller: firstPage?.seller ?? false,
                total: firstPage?.total ?? 0,
                summary: firstPage?.summary ?? null,
                transactions: data.pages.flatMap((page) => page.transactions),
                hasMore: data.pages.at(-1)?.hasMore ?? false,
            }
        },
        staleTime: 60 * 1000,
    })
}
