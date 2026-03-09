'use client'

import { type DragEvent, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Accordion, AccordionItem, Select, SelectItem, Tab, Tabs } from '@heroui/react'
import {
    AlertTriangle,
    CheckCheck,
    ClipboardList,
    GripVertical,
    KanbanSquare,
    ListTodo,
    MoveRight,
    PackageSearch,
    Plus,
    RotateCcw,
    Trash2,
} from 'lucide-react'

import useLocalStorage from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Input } from '@/ui/input'

import type { PurchaseTask, StockEntry, StockFilter } from './stock-types'

type StockManagerProps = {
    entries: StockEntry[]
    categories: string[]
    initialStockFilter: StockFilter
    initialCategoryFilter: string | null
    rpcError: string | null
}

type ViewMode = 'roadmap' | 'list'

type ResolvedTask = PurchaseTask & {
    colors: string[]
}

type TaskGroup = {
    category: string
    items: ResolvedTask[]
}

const PURCHASE_STORAGE_KEY = 'seller-stock-purchase-list-v1'
const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
})

function formatMoney(value: number | null): string {
    if (value == null || Number.isNaN(value)) {
        return 'N/A'
    }

    return currency.format(value)
}

function recommendedTarget(quantity: number): number {
    if (quantity <= 0) {
        return 6
    }

    return 4
}

function createTask(entry: StockEntry, quantityToBuy?: number): PurchaseTask {
    const defaultTarget = Math.max(entry.quantity + 1, recommendedTarget(entry.quantity))
    const normalizedBuyQty =
        typeof quantityToBuy === 'number' && Number.isFinite(quantityToBuy)
            ? Math.max(1, Math.trunc(quantityToBuy))
            : null

    return {
        taskId: entry.variantId,
        variantId: entry.variantId,
        category: entry.category,
        productName: entry.productName,
        brand: entry.brand,
        currentQty: entry.quantity,
        targetQty: normalizedBuyQty == null ? defaultTarget : entry.quantity + normalizedBuyQty,
        purchasePrice: entry.purchasePrice,
        checked: false,
        note: '',
    }
}

function sortEntry(left: StockEntry, right: StockEntry) {
    if (left.quantity !== right.quantity) {
        return left.quantity - right.quantity
    }

    return left.productName.localeCompare(right.productName)
}

function urgencyBadgeClasses(urgency: StockEntry['urgency']) {
    return urgency === 'out'
        ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
        : 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
}

function getLaneWidth(items: StockEntry[]): number {
    const longestTitle = items.reduce(
        (max, item) => Math.max(max, `${item.productName} ${item.brand}`.length),
        0
    )
    const maxColorCount = items.reduce((max, item) => Math.max(max, item.colors.length), 0)
    const textExpansion = Math.max(0, longestTitle - 24) * 4
    const colorExpansion = maxColorCount > 4 ? 20 : 0
    const raw = 286 + textExpansion + colorExpansion

    return Math.max(286, Math.min(raw, 390))
}

export function StockManager({
    entries,
    categories,
    initialStockFilter,
    initialCategoryFilter,
    rpcError,
}: StockManagerProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [viewMode, setViewMode] = useState<ViewMode>('roadmap')
    const [selectedStock, setSelectedStock] = useState<StockFilter>(initialStockFilter)
    const [selectedCategory, setSelectedCategory] = useState(initialCategoryFilter ?? 'all')
    const [tasks, setTasks] = useLocalStorage<PurchaseTask[]>(PURCHASE_STORAGE_KEY, [])
    const [draggingVariantId, setDraggingVariantId] = useState<string | null>(null)
    const [dropActive, setDropActive] = useState(false)

    useEffect(() => {
        setSelectedStock(initialStockFilter)
        setSelectedCategory(initialCategoryFilter ?? 'all')
    }, [initialCategoryFilter, initialStockFilter])

    const entryByVariant = useMemo(() => {
        return new Map(entries.map((entry) => [entry.variantId, entry]))
    }, [entries])

    const groupedEntries = useMemo(() => {
        const map = new Map<string, StockEntry[]>()

        for (const entry of entries) {
            const group = map.get(entry.category)
            if (group) {
                group.push(entry)
                continue
            }

            map.set(entry.category, [entry])
        }

        return [...map.entries()]
            .map(([category, items]) => ({ category, items: [...items].sort(sortEntry) }))
            .sort((left, right) => left.category.localeCompare(right.category))
    }, [entries])

    const taskMap = useMemo(() => {
        return new Map(tasks.map((task) => [task.variantId, task]))
    }, [tasks])

    const resolvedTasks = useMemo<ResolvedTask[]>(() => {
        return tasks.map((task) => {
            const latest = entryByVariant.get(task.variantId)

            if (!latest) {
                return {
                    ...task,
                    colors: [],
                }
            }

            return {
                ...task,
                category: latest.category,
                productName: latest.productName,
                brand: latest.brand,
                currentQty: latest.quantity,
                purchasePrice: latest.purchasePrice,
                colors: latest.colors,
            }
        })
    }, [tasks, entryByVariant])

    const openTasks = useMemo(() => {
        return resolvedTasks
            .filter((task) => !task.checked)
            .sort((left, right) => left.category.localeCompare(right.category))
    }, [resolvedTasks])

    const doneTasks = useMemo(() => {
        return resolvedTasks
            .filter((task) => task.checked)
            .sort((left, right) => left.category.localeCompare(right.category))
    }, [resolvedTasks])

    const groupedOpenTasks = useMemo(() => {
        const map = new Map<string, ResolvedTask[]>()

        for (const task of openTasks) {
            const group = map.get(task.category)
            if (group) {
                group.push(task)
                continue
            }
            map.set(task.category, [task])
        }

        return [...map.entries()]
            .map(([category, items]) => ({
                category,
                items: [...items].sort((a, b) => a.productName.localeCompare(b.productName)),
            }))
            .sort((a, b) => a.category.localeCompare(b.category))
    }, [openTasks])

    const groupedDoneTasks = useMemo(() => {
        const map = new Map<string, ResolvedTask[]>()

        for (const task of doneTasks) {
            const group = map.get(task.category)
            if (group) {
                group.push(task)
                continue
            }
            map.set(task.category, [task])
        }

        return [...map.entries()]
            .map(([category, items]) => ({
                category,
                items: [...items].sort((a, b) => a.productName.localeCompare(b.productName)),
            }))
            .sort((a, b) => a.category.localeCompare(b.category))
    }, [doneTasks])

    const stockSummary = useMemo(() => {
        const out = entries.filter((entry) => entry.urgency === 'out').length
        const low = entries.filter((entry) => entry.urgency === 'low').length

        return {
            total: entries.length,
            out,
            low,
            categories: groupedEntries.length,
        }
    }, [entries, groupedEntries.length])

    const purchaseSummary = useMemo(() => {
        let estimate = 0
        let units = 0

        for (const task of resolvedTasks) {
            const quantityToBuy = Math.max(0, task.targetQty - task.currentQty)
            units += quantityToBuy

            if (task.purchasePrice != null) {
                estimate += quantityToBuy * task.purchasePrice
            }
        }

        return {
            total: resolvedTasks.length,
            open: openTasks.length,
            done: doneTasks.length,
            units,
            estimate,
        }
    }, [doneTasks.length, openTasks.length, resolvedTasks])

    const addAllCount = useMemo(() => {
        let count = 0

        for (const entry of entries) {
            if (!taskMap.has(entry.variantId)) {
                count += 1
            }
        }

        return count
    }, [entries, taskMap])

    const categoryOptions = useMemo(
        () => [
            { key: 'all', label: 'All categories' },
            ...categories.map((c) => ({ key: c, label: c })),
        ],
        [categories]
    )

    const applyFilter = () => {
        const params = new URLSearchParams(searchParams.toString())

        params.set('stock', selectedStock)
        if (selectedCategory === 'all') {
            params.delete('category')
        } else {
            params.set('category', selectedCategory)
        }

        const query = params.toString()
        router.push(query ? `${pathname}?${query}` : pathname)
    }

    const resetFilter = () => {
        setSelectedStock('both')
        setSelectedCategory('all')
        router.push(pathname)
    }

    const askQuantityToBuy = (entry: StockEntry): number | null => {
        const suggested = Math.max(1, recommendedTarget(entry.quantity) - entry.quantity)
        const message = `How many units of "${entry.productName}" do you want to buy?`
        const raw = window.prompt(message, String(suggested))

        if (raw == null) {
            return null
        }

        const parsed = Number.parseInt(raw, 10)
        if (Number.isNaN(parsed) || parsed < 1) {
            return suggested
        }

        return parsed
    }

    const addTask = (entry: StockEntry, askQuantity: boolean = false) => {
        const quantityToBuy = askQuantity ? askQuantityToBuy(entry) : undefined
        if (askQuantity && quantityToBuy == null) {
            return
        }
        const normalizedQuantity = quantityToBuy == null ? undefined : quantityToBuy

        setTasks((prev) => {
            if (prev.some((task) => task.variantId === entry.variantId)) {
                return prev
            }

            return [createTask(entry, normalizedQuantity), ...prev]
        })
    }

    const addTaskFromVariant = (variantId: string, askQuantity: boolean = false) => {
        const entry = entryByVariant.get(variantId)
        if (!entry) {
            return
        }

        addTask(entry, askQuantity)
    }

    const addAllVisible = () => {
        setTasks((prev) => {
            const existing = new Set(prev.map((task) => task.variantId))
            const additions = entries
                .filter((entry) => !existing.has(entry.variantId))
                .map((entry) => createTask(entry))

            if (!additions.length) {
                return prev
            }

            return [...additions, ...prev]
        })
    }

    const updateTask = (taskId: string, patch: Partial<PurchaseTask>) => {
        setTasks((prev) =>
            prev.map((task) => (task.taskId === taskId ? { ...task, ...patch } : task))
        )
    }

    const removeTask = (taskId: string) => {
        setTasks((prev) => prev.filter((task) => task.taskId !== taskId))
    }

    const markAllDone = () => {
        setTasks((prev) => prev.map((task) => ({ ...task, checked: true })))
    }

    const clearDone = () => {
        setTasks((prev) => prev.filter((task) => !task.checked))
    }

    const onDropToList = (event: DragEvent) => {
        event.preventDefault()
        const variantId = event.dataTransfer.getData('text/plain')

        setDropActive(false)
        setDraggingVariantId(null)

        if (!variantId) {
            return
        }

        addTaskFromVariant(variantId, true)
    }

    return (
        <main className='from-background via-background to-muted/25 h-[calc(100dvh-4rem)] overflow-hidden bg-linear-to-b p-3 sm:p-4'>
            <div className='mx-auto flex h-full w-full max-w-350 flex-col gap-3 overflow-hidden'>
                {rpcError && (
                    <div className='border-destructive/40 bg-destructive/10 flex items-start gap-2 rounded-lg border p-3 text-sm'>
                        <AlertTriangle className='text-destructive mt-0.5 h-4 w-4 shrink-0' />
                        <p className='text-destructive'>{rpcError}</p>
                    </div>
                )}

                <Card className='border-border/70 bg-card/85 py-2.5'>
                    <CardContent className='space-y-2 px-3'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                            <div className='min-w-0'>
                                <p className='text-muted-foreground text-[11px] font-semibold tracking-[0.15em] uppercase'>
                                    Seller stock control
                                </p>
                                <h1 className='line-clamp-1 text-lg font-semibold sm:text-xl'>
                                    Stock roadmap and purchase board
                                </h1>
                            </div>

                            <Tabs
                                aria-label='Stock views'
                                classNames={{
                                    base: 'border-border/70 bg-background/60 rounded-lg border p-1',
                                    cursor: 'rounded-md',
                                    panel: 'hidden',
                                    tab: 'h-7 px-2',
                                    tabList: 'gap-1 p-0',
                                }}
                                selectedKey={viewMode}
                                size='sm'
                                variant='solid'
                                onSelectionChange={(key) => setViewMode(String(key) as ViewMode)}
                            >
                                <Tab
                                    key='roadmap'
                                    title={
                                        <span className='inline-flex items-center gap-1.5'>
                                            <KanbanSquare className='h-4 w-4' />
                                            Roadmap board
                                        </span>
                                    }
                                />
                                <Tab
                                    key='list'
                                    title={
                                        <span className='inline-flex items-center gap-1.5'>
                                            <ListTodo className='h-4 w-4' />
                                            My list
                                        </span>
                                    }
                                />
                            </Tabs>
                        </div>

                        <div className='grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-center'>
                            <Select
                                aria-label='Stock filter'
                                className='w-full'
                                classNames={{
                                    trigger: 'h-8 min-h-8',
                                    value: 'text-sm',
                                }}
                                selectedKeys={[selectedStock]}
                                size='sm'
                                variant='bordered'
                                onSelectionChange={(keys) => {
                                    const next = Array.from(keys)[0]
                                    if (!next) {
                                        return
                                    }
                                    setSelectedStock(String(next) as StockFilter)
                                }}
                            >
                                <SelectItem key='both'>Out + Low</SelectItem>
                                <SelectItem key='out'>Out of stock</SelectItem>
                                <SelectItem key='low'>Low stock</SelectItem>
                            </Select>

                            <Select
                                aria-label='Category'
                                className='w-full'
                                classNames={{
                                    trigger: 'h-8 min-h-8',
                                    value: 'text-sm',
                                }}
                                items={categoryOptions}
                                selectedKeys={[selectedCategory]}
                                size='sm'
                                variant='bordered'
                                onSelectionChange={(keys) => {
                                    const next = Array.from(keys)[0]
                                    if (!next) {
                                        return
                                    }
                                    setSelectedCategory(String(next))
                                }}
                            >
                                {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                            </Select>

                            <div className='flex gap-2'>
                                <Button className='h-8 px-3 text-sm' onClick={applyFilter}>
                                    Apply
                                </Button>
                                <Button
                                    className='h-8 px-2.5 text-sm'
                                    variant='outline'
                                    onClick={resetFilter}
                                >
                                    <RotateCcw className='h-4 w-4' />
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-1.5 sm:grid-cols-4'>
                            <div className='border-border/70 bg-background/60 rounded-md border px-2 py-1.5'>
                                <p className='text-muted-foreground text-[10px]'>Items</p>
                                <p className='text-sm leading-tight font-semibold'>
                                    {stockSummary.total}
                                </p>
                            </div>
                            <div className='rounded-md border border-red-300/60 bg-red-50/40 px-2 py-1.5 dark:bg-red-950/20'>
                                <p className='text-muted-foreground text-[10px]'>Out</p>
                                <p className='text-sm leading-tight font-semibold'>
                                    {stockSummary.out}
                                </p>
                            </div>
                            <div className='rounded-md border border-amber-300/60 bg-amber-50/40 px-2 py-1.5 dark:bg-amber-950/20'>
                                <p className='text-muted-foreground text-[10px]'>Low</p>
                                <p className='text-sm leading-tight font-semibold'>
                                    {stockSummary.low}
                                </p>
                            </div>
                            <div className='border-border/70 bg-background/60 rounded-md border px-2 py-1.5'>
                                <p className='text-muted-foreground text-[10px]'>Budget</p>
                                <p className='text-sm leading-tight font-semibold'>
                                    {formatMoney(purchaseSummary.estimate)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {viewMode === 'roadmap' ? (
                    <section className='flex min-h-0 flex-col gap-3'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                            <h2 className='flex items-center gap-2 text-lg font-semibold'>
                                <PackageSearch className='text-muted-foreground h-4 w-4' />
                                Category roadmap lanes
                            </h2>
                            <Button
                                disabled={addAllCount === 0}
                                size='sm'
                                variant='outline'
                                onClick={addAllVisible}
                            >
                                <Plus className='h-4 w-4' />
                                Add all visible ({addAllCount})
                            </Button>
                        </div>

                        {!groupedEntries.length && (
                            <Card className='border-dashed py-12'>
                                <CardContent className='flex flex-col items-center gap-2 text-center'>
                                    <PackageSearch className='text-muted-foreground h-8 w-8' />
                                    <p className='text-base font-semibold'>No products found</p>
                                    <p className='text-muted-foreground max-w-sm text-sm'>
                                        Try a different stock filter or category.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {!!groupedEntries.length && (
                            <div className='grid min-h-0 flex-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)]'>
                                <section
                                    className={cn(
                                        'flex min-h-0 flex-col rounded-xl border-2 border-dashed p-3 transition xl:sticky xl:top-3 xl:self-start',
                                        dropActive
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border/70 bg-card/70'
                                    )}
                                    onDragLeave={() => setDropActive(false)}
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                        setDropActive(true)
                                    }}
                                    onDrop={onDropToList}
                                >
                                    <h3 className='text-sm font-semibold'>Purchase list board</h3>
                                    <p className='text-muted-foreground mt-1 text-xs'>
                                        Drop items here. On add, you will be asked how many units to
                                        buy.
                                    </p>

                                    <div className='mt-3 grid grid-cols-2 gap-2 text-xs'>
                                        <p className='border-border/70 rounded-md border p-2'>
                                            <span className='text-muted-foreground block'>
                                                Open
                                            </span>
                                            <strong>{purchaseSummary.open}</strong>
                                        </p>
                                        <p className='border-border/70 rounded-md border p-2'>
                                            <span className='text-muted-foreground block'>
                                                Done
                                            </span>
                                            <strong>{purchaseSummary.done}</strong>
                                        </p>
                                    </div>

                                    <div className='mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto'>
                                        {openTasks.slice(0, 10).map((task) => (
                                            <div
                                                key={task.taskId}
                                                className='border-border/70 bg-background/70 rounded-md border p-2'
                                            >
                                                <div className='flex items-start gap-2'>
                                                    <GripVertical className='text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0' />
                                                    <div className='min-w-0 flex-1'>
                                                        <p className='line-clamp-1 text-xs font-semibold'>
                                                            {task.productName}
                                                        </p>
                                                        <p className='text-muted-foreground text-[11px]'>
                                                            {task.brand} - {task.category}
                                                        </p>
                                                        {!!task.colors.length && (
                                                            <div className='mt-1 flex flex-wrap gap-1'>
                                                                {task.colors
                                                                    .slice(0, 2)
                                                                    .map((color) => (
                                                                        <Badge
                                                                            key={`${task.taskId}-${color}`}
                                                                            variant='outline'
                                                                        >
                                                                            {color}
                                                                        </Badge>
                                                                    ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {!openTasks.length && (
                                            <div className='text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs'>
                                                Your to-do list is empty.
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        className='mt-3 w-full'
                                        size='sm'
                                        onClick={() => setViewMode('list')}
                                    >
                                        Open my list
                                    </Button>
                                </section>

                                <div className='min-h-0 min-w-0 overflow-x-auto overflow-y-hidden pb-1'>
                                    <div className='flex h-full min-w-max gap-3'>
                                        {groupedEntries.map((group) => (
                                            <section
                                                key={group.category}
                                                className='bg-card/85 border-border/70 flex h-full min-h-0 shrink-0 flex-col rounded-xl border'
                                                style={{ width: `${getLaneWidth(group.items)}px` }}
                                            >
                                                <header className='border-border/70 border-b px-3 py-2.5'>
                                                    <div className='flex items-center justify-between gap-2'>
                                                        <h3 className='line-clamp-1 text-sm font-semibold'>
                                                            {group.category}
                                                        </h3>
                                                        <Badge variant='outline'>
                                                            {group.items.length}
                                                        </Badge>
                                                    </div>
                                                </header>

                                                <div className='min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2.5'>
                                                    {group.items.map((entry) => {
                                                        const inList = taskMap.has(entry.variantId)
                                                        const visibleColors = entry.colors.slice(
                                                            0,
                                                            3
                                                        )
                                                        const extraColors = Math.max(
                                                            0,
                                                            entry.colors.length -
                                                                visibleColors.length
                                                        )

                                                        return (
                                                            <article
                                                                key={entry.variantId}
                                                                className={cn(
                                                                    'border-border/70 bg-background/70 rounded-md border p-2 transition',
                                                                    draggingVariantId ===
                                                                        entry.variantId &&
                                                                        'opacity-50'
                                                                )}
                                                                draggable
                                                                onDragEnd={() =>
                                                                    setDraggingVariantId(null)
                                                                }
                                                                onDragStart={(event) => {
                                                                    event.dataTransfer.effectAllowed =
                                                                        'copy'
                                                                    event.dataTransfer.setData(
                                                                        'text/plain',
                                                                        entry.variantId
                                                                    )
                                                                    setDraggingVariantId(
                                                                        entry.variantId
                                                                    )
                                                                }}
                                                            >
                                                                <div className='flex items-start gap-2'>
                                                                    <GripVertical className='text-muted-foreground mt-0.5 h-3.5 w-3.5 shrink-0' />
                                                                    <div className='min-w-0 flex-1'>
                                                                        <h4 className='line-clamp-1 text-xs font-semibold'>
                                                                            {entry.productName}
                                                                        </h4>
                                                                        <p className='text-muted-foreground text-[11px]'>
                                                                            {entry.brand} -{' '}
                                                                            {group.category}
                                                                        </p>
                                                                        <div className='mt-1 flex flex-wrap items-center gap-1'>
                                                                            <Badge
                                                                                className={urgencyBadgeClasses(
                                                                                    entry.urgency
                                                                                )}
                                                                                variant='outline'
                                                                            >
                                                                                {entry.urgency ===
                                                                                'out'
                                                                                    ? 'Out'
                                                                                    : 'Low'}
                                                                            </Badge>
                                                                            {visibleColors.map(
                                                                                (color) => (
                                                                                    <Badge
                                                                                        key={`${entry.variantId}-${color}`}
                                                                                        variant='outline'
                                                                                    >
                                                                                        {color}
                                                                                    </Badge>
                                                                                )
                                                                            )}
                                                                            {extraColors > 0 && (
                                                                                <Badge variant='outline'>
                                                                                    +{extraColors}{' '}
                                                                                    more
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className='text-muted-foreground mt-1 text-[11px]'>
                                                                            Qty {entry.quantity} -{' '}
                                                                            {formatMoney(
                                                                                entry.purchasePrice
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div className='flex flex-col items-end gap-1'>
                                                                        <Button
                                                                            disabled={inList}
                                                                            size='sm'
                                                                            variant={
                                                                                inList
                                                                                    ? 'secondary'
                                                                                    : 'default'
                                                                            }
                                                                            className='h-7 px-2 text-xs'
                                                                            onClick={() =>
                                                                                addTask(entry, true)
                                                                            }
                                                                        >
                                                                            {inList
                                                                                ? 'Added'
                                                                                : 'Add'}
                                                                        </Button>
                                                                        <p className='text-muted-foreground flex items-center gap-1 text-[11px]'>
                                                                            <MoveRight className='h-3 w-3' />
                                                                            Drag
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </article>
                                                        )
                                                    })}
                                                </div>
                                            </section>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                ) : (
                    <section className='flex min-h-0 flex-col gap-3 overflow-hidden'>
                        <Card className='border-border/70 flex min-h-0 flex-col gap-3 py-4'>
                            <CardHeader className='px-4'>
                                <CardTitle className='text-base'>My purchase list</CardTitle>
                                <CardDescription>
                                    Categories are collapsible. Open only what you want to work on.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='min-h-0 space-y-3 overflow-hidden px-4'>
                                <div className='flex flex-wrap gap-2'>
                                    <Button
                                        disabled={!purchaseSummary.total}
                                        size='sm'
                                        variant='outline'
                                        onClick={markAllDone}
                                    >
                                        <CheckCheck className='h-4 w-4' />
                                        Mark all done
                                    </Button>
                                    <Button
                                        disabled={!doneTasks.length}
                                        size='sm'
                                        variant='outline'
                                        onClick={clearDone}
                                    >
                                        <Trash2 className='h-4 w-4' />
                                        Clear done
                                    </Button>
                                </div>

                                <TaskCategoryAccordion
                                    emptyText='No open tasks. Add items from roadmap board.'
                                    groups={groupedOpenTasks}
                                    onRemove={removeTask}
                                    onUpdate={updateTask}
                                />
                            </CardContent>
                        </Card>

                        <Card className='border-border/70 flex min-h-0 flex-col gap-3 py-4'>
                            <CardHeader className='px-4'>
                                <CardTitle className='text-base'>Completed</CardTitle>
                                <CardDescription>
                                    Completed items grouped by category.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='min-h-0 overflow-hidden px-4'>
                                <TaskCategoryAccordion
                                    emptyText='Completed items will appear here.'
                                    groups={groupedDoneTasks}
                                    onRemove={removeTask}
                                    onUpdate={updateTask}
                                />
                            </CardContent>
                        </Card>
                    </section>
                )}
            </div>
        </main>
    )
}

function TaskRow({
    task,
    onUpdate,
    onRemove,
}: {
    task: ResolvedTask
    onUpdate: (taskId: string, patch: Partial<PurchaseTask>) => void
    onRemove: (taskId: string) => void
}) {
    const minimumTarget = task.currentQty + 1
    const quantityToBuy = Math.max(0, task.targetQty - task.currentQty)

    return (
        <article className='border-border/60 bg-background/70 space-y-2 rounded-md border p-2.5'>
            <div className='flex items-start gap-2'>
                <Checkbox
                    checked={task.checked}
                    onCheckedChange={(checked) =>
                        onUpdate(task.taskId, {
                            checked: checked === true,
                        })
                    }
                />

                <div className='min-w-0 flex-1'>
                    <p
                        className={cn(
                            'line-clamp-1 text-sm font-medium',
                            task.checked && 'text-muted-foreground line-through'
                        )}
                    >
                        {task.productName}
                    </p>
                    <p className='text-muted-foreground text-[11px]'>
                        {task.brand} - {task.category}
                    </p>
                    <div className='mt-1 flex flex-wrap gap-1'>
                        {task.colors.length
                            ? task.colors.map((color) => (
                                  <Badge key={`${task.taskId}-${color}`} variant='outline'>
                                      {color}
                                  </Badge>
                              ))
                            : null}
                    </div>
                </div>

                <Button size='icon' variant='ghost' onClick={() => onRemove(task.taskId)}>
                    <Trash2 className='h-4 w-4' />
                </Button>
            </div>

            <div className='grid grid-cols-[1fr_auto] items-end gap-2'>
                <label className='text-xs'>
                    <span className='text-muted-foreground mb-1 block'>Note</span>
                    <Input
                        className='h-8 text-xs'
                        placeholder='Supplier / priority...'
                        value={task.note}
                        onChange={(event) => onUpdate(task.taskId, { note: event.target.value })}
                    />
                </label>

                <label className='w-24 text-xs'>
                    <span className='text-muted-foreground mb-1 block text-right'>Target</span>
                    <Input
                        className='h-8 text-xs'
                        min={minimumTarget}
                        type='number'
                        value={task.targetQty}
                        onChange={(event) => {
                            const parsed = Number.parseInt(event.target.value, 10)
                            const next = Number.isNaN(parsed)
                                ? minimumTarget
                                : Math.max(parsed, minimumTarget)

                            onUpdate(task.taskId, { targetQty: next })
                        }}
                    />
                </label>
            </div>

            <div className='text-muted-foreground flex items-center justify-between text-[11px]'>
                <span>
                    Qty {task.currentQty} to {task.targetQty}
                </span>
                <span>
                    Need {quantityToBuy} x {formatMoney(task.purchasePrice)}
                </span>
            </div>
        </article>
    )
}

function TaskCategoryAccordion({
    groups,
    emptyText,
    onUpdate,
    onRemove,
}: {
    groups: TaskGroup[]
    emptyText: string
    onUpdate: (taskId: string, patch: Partial<PurchaseTask>) => void
    onRemove: (taskId: string) => void
}) {
    if (!groups.length) {
        return (
            <div className='text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm'>
                {emptyText}
            </div>
        )
    }

    return (
        <Accordion
            itemClasses={{
                base: 'border border-border/70 rounded-lg px-0',
                content: 'pt-0 pb-3 px-3',
                indicator: 'text-muted-foreground',
                subtitle: 'text-muted-foreground text-xs',
                title: 'text-sm font-semibold',
                trigger: 'px-3 py-2.5',
            }}
            selectionMode='multiple'
            variant='splitted'
        >
            {groups.map((group) => (
                <AccordionItem
                    key={group.category}
                    subtitle={`${group.items.length} item${group.items.length === 1 ? '' : 's'}`}
                    title={group.category}
                >
                    <div className='max-h-[40dvh] space-y-2 overflow-y-auto pr-1'>
                        {group.items.map((task) => (
                            <TaskRow
                                key={task.taskId}
                                task={task}
                                onRemove={onRemove}
                                onUpdate={onUpdate}
                            />
                        ))}
                    </div>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
