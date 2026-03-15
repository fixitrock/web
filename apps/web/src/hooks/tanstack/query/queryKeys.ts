export const queryKeys = {
    brands: {
        all: ['brands'] as const,
    },
    productCategories: {
        all: ['product-categories'] as const,
    },
    sellerProducts: {
        all: ['seller-products'] as const,
        list: (search: string, category: string) =>
            [...queryKeys.sellerProducts.all, { search, category }] as const,
    },
    productSlug: {
        all: ['product'] as const,
        list: (slug: string) =>
            [...queryKeys.productSlug.all, { slug }] as const,
    },
    storefrontProducts: {
        all: ['storefront-products'] as const,
        list: (
            username: string,
            search: string,
            category: string,
            page?: number,
            limit?: number
        ) =>
            [
                ...queryKeys.storefrontProducts.all,
                {
                    username,
                    search,
                    category,
                    page: page ?? null,
                    limit: limit ?? null,
                },
            ] as const,
    },
    storefrontProductCategories: {
        all: ['storefront-product-categories'] as const,
        list: (username: string) => [...queryKeys.storefrontProductCategories.all, username] as const,
    },
    sellerOrders: {
        all: ['seller-orders'] as const,
        list: (search: string) => [...queryKeys.sellerOrders.all, { search }] as const,
    },
    buyerOrders: {
        all: ['buyer-orders'] as const,
        list: (search: string) => [...queryKeys.buyerOrders.all, { search }] as const,
    },
    sellerRecentOrders: {
        all: ['seller-recent-orders'] as const,
        list: (username: string) => [...queryKeys.sellerRecentOrders.all, username] as const,
    },
    sellerTopStats: {
        all: ['seller-top-stats'] as const,
        list: (username: string) => [...queryKeys.sellerTopStats.all, username] as const,
    },
    customerTransactions: {
        all: ['customer-transactions'] as const,
        list: (userPhone: number) => [...queryKeys.customerTransactions.all, userPhone] as const,
    },
    transactionHistorySearch: {
        all: ['transaction-history-search'] as const,
        list: (search: string) => [...queryKeys.transactionHistorySearch.all, { search }] as const,
    },
    transactionHistoryByUser: {
        all: ['transaction-history-by-user'] as const,
        list: (userId?: string | null) =>
            [...queryKeys.transactionHistoryByUser.all, userId ?? null] as const,
    },
    customerSearch: {
        all: ['customer-search'] as const,
        list: (query: string) => [...queryKeys.customerSearch.all, { query }] as const,
    },
    invoices: {
        all: ['invoices'] as const,
    },
}
