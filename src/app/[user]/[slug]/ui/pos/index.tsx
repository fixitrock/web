'use client'

import React from 'react'

import { PosHeader } from './header'
import { PosCart } from './cart'
import { PosProduct } from './product'

export function Pos() {
    return (
        <main className='flex h-[calc(100vh-78px)] flex-col gap-2 p-2 2xl:px-[10%]'>
            <PosHeader />
            <div className='flex flex-1 gap-2 overflow-hidden'>
                <PosProduct />
                <PosCart />
            </div>
        </main>
    )
}
