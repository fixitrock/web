'use client'

import { useEffect, useState } from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import matter from 'gray-matter'

import { cn, logWarning } from '@/lib/utils'

import { IMG, Title, YouTube } from './components'

type ReadmeProps = {
    raw?: string
    src?: string
    className?: string
}

export function Readme({ raw, src, className }: ReadmeProps) {
    const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                let markdown = raw || ''

                if (!markdown && src) {
                    const res = await fetch(src)

                    if (!res.ok) throw new Error(`Failed to fetch src: ${res.statusText}`)
                    markdown = await res.text()
                }

                if (!markdown) return

                const { content } = matter(markdown)
                const serialized = await serialize(content)

                setMdxSource(serialized)
            } catch (err) {
                logWarning('MDX client error:', err)
            }
        }

        load()
    }, [raw, src])

    if (!mdxSource) return null

    return (
        <div className={cn('mdx', className)}>
            <MDXRemote {...mdxSource} components={{ img: IMG, Title, YouTube }} />
        </div>
    )
}
