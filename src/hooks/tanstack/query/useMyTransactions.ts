import { useInfiniteQuery } from '@tanstack/react-query'
import { myTransactions } from '@/actions/user/transactions'

export function useMyTransactions(search: string = '') {
    return useInfiniteQuery({
        queryKey: ['transactions', search],
        queryFn: ({ pageParam = 1 }) => myTransactions(search, pageParam as number),

        initialPageParam: 1,

        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),

        select: (data) => {
            const firstPage = data.pages[0]

            return {
                view: firstPage.view,
                total: firstPage.total,

                pages: data.pages,
                transactions: data.pages.flatMap((p) => p.transaction),
                hasMore: data.pages.at(-1)?.hasMore ?? false,
            }
        },
    })
}
