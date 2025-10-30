'use client'

import { Button, Pagination } from '@heroui/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import React from 'react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    showPagination: boolean
    setCurrentPage: (page: number | ((prevPage: number) => number)) => void
}

export function BottomContent({
    currentPage,
    totalPages,
    showPagination,
    setCurrentPage,
}: PaginationProps) {
    if (!showPagination) return null

    return (
        <div className='flex items-center justify-center border-t p-3 sm:justify-between'>
            <Button
                className='bg-default/20 hidden sm:flex'
                isDisabled={currentPage <= 1}
                size='sm'
                startContent={<ArrowLeft size={18} />}
                variant='light'
                onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
                Previous
            </Button>
            <Pagination
                classNames={{ wrapper: 'gap-2' }}
                page={currentPage}
                radius='full'
                size='sm'
                total={totalPages}
                onChange={setCurrentPage}
            />
            <Button
                className='bg-default/20 hidden sm:flex'
                endContent={<ArrowRight size={18} />}
                isDisabled={currentPage >= totalPages}
                size='sm'
                onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
                Next
            </Button>
        </div>
    )
}
