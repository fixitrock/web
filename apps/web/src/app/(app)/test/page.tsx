import { createClient } from '@/supabase/server'

import { StockManager } from './stock-manager'
import type { StockEntry, StockFilter } from './stock-types'
import page from '../page'

type SearchParams = { [key: string]: string | string[] | undefined }

type TestPageProps = {
    searchParams: Promise<SearchParams>
}

const VALID_STOCK_FILTERS: ReadonlySet<StockFilter> = new Set(['out', 'low', 'both'])

function toSingleValue(value: string | string[] | undefined): string | null {
    if (Array.isArray(value)) {
        return value[0] ?? null
    }

    return typeof value === 'string' ? value : null
}

function parseStockFilter(value: string | null): StockFilter {
    if (!value) {
        return 'both'
    }

    return VALID_STOCK_FILTERS.has(value as StockFilter) ? (value as StockFilter) : 'both'
}

function parseCategoryFilter(value: string | null): string | null {
    if (!value) {
        return null
    }

    const normalized = value.trim()
    if (!normalized || normalized.toLowerCase() === 'all') {
        return null
    }

    return normalized
}

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const parsed = Number.parseFloat(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    return null
}

function toColorList(value: unknown): string[] {
    const parseItem = (item: unknown): string | null => {
        if (typeof item === 'string') {
            const trimmed = item.trim()
            return trimmed || null
        }

        if (typeof item === 'number' || typeof item === 'boolean') {
            return String(item)
        }

        return null
    }

    if (Array.isArray(value)) {
        return value.map(parseItem).filter((item): item is string => Boolean(item))
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()

        if (!trimmed) {
            return []
        }

        try {
            const parsed = JSON.parse(trimmed) as unknown
            if (Array.isArray(parsed)) {
                return parsed.map(parseItem).filter((item): item is string => Boolean(item))
            }
        } catch {
            return [trimmed]
        }

        return [trimmed]
    }

    return []
}

function normalizeStockData(payload: unknown): StockEntry[] {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return []
    }

    const normalized: StockEntry[] = []
    const grouped = payload as Record<string, unknown>

    for (const [rawCategory, rawItems] of Object.entries(grouped)) {
        if (!Array.isArray(rawItems)) {
            continue
        }

        const category = rawCategory.trim() || 'Uncategorized'

        for (let index = 0; index < rawItems.length; index += 1) {
            const item = rawItems[index]
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
                continue
            }

            const row = item as Record<string, unknown>
            const quantity = Math.max(0, Math.trunc(toNumber(row.quantity) ?? 0))
            const productName =
                typeof row.product_name === 'string' && row.product_name.trim()
                    ? row.product_name.trim()
                    : 'Unnamed Product'
            const brand =
                typeof row.brand === 'string' && row.brand.trim() ? row.brand.trim() : 'Unknown'
            const variantId =
                row.variant_id != null
                    ? String(row.variant_id)
                    : `${category}-${productName}-${index}`

            normalized.push({
                variantId,
                category,
                productName,
                brand,
                quantity,
                purchasePrice: toNumber(row.purchase_price),
                colors: toColorList(row.color),
                urgency: quantity <= 0 ? 'out' : 'low',
            })
        }
    }

    return normalized.sort((left, right) => {
        if (left.quantity !== right.quantity) {
            return left.quantity - right.quantity
        }

        const categoryCompare = left.category.localeCompare(right.category)
        if (categoryCompare !== 0) {
            return categoryCompare
        }

        return left.productName.localeCompare(right.productName)
    })
}

export default async function TestPage({ searchParams }: TestPageProps) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('my_transactions', {
        u_id: '11c97919-2362-45d3-9d07-5c15b767a9b0',
    })
    // const params = await searchParams
    // const stockFilter = parseStockFilter(toSingleValue(params.stock))
    // const categoryFilter = parseCategoryFilter(toSingleValue(params.category))
    // const supabase = await createClient()

    // const [{ data, error }, { data: categoryData, error: categoryError }] = await Promise.all([
    //     supabase.rpc('seller_stock', {
    //         stock_filter: stockFilter,
    //         category_filter: categoryFilter,
    //     }),
    //     supabase.rpc('seller_stock', {
    //         stock_filter: 'both',
    //         category_filter: null,
    //     }),
    // ])

    // const entries = normalizeStockData(data)
    // const allCategoryEntries = normalizeStockData(categoryData)
    // const categorySet = new Set<string>(allCategoryEntries.map((entry) => entry.category))

    // for (const entry of entries) {
    //     categorySet.add(entry.category)
    // }

    // const categories = [...categorySet].sort((a, b) => a.localeCompare(b))

    return (
        <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
        // <StockManager
        //     categories={categories}
        //     entries={entries}
        //     initialCategoryFilter={categoryFilter}
        //     initialStockFilter={stockFilter}
        //     rpcError={error?.message ?? categoryError?.message ?? null}
        // />
    )
}
