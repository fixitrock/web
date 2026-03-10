'use client'

import { cn } from '@/lib/utils'
import DOMPurify from 'isomorphic-dompurify'
import { useMemo } from 'react'

interface RichTextContentProps {
    content?: string
    className?: string
    plainTextClassName?: string
}

const htmlTagPattern = /<\/?[a-z][\s\S]*>/i

/* 🔥 Normalize broken table HTML (tr/td without table wrapper) */
function normalizeHtml(html: string) {
    if (!html) return html

    if ((html.includes('<td') || html.includes('<tr')) && !html.includes('<table')) {
        return `<table><tbody>${html}</tbody></table>`
    }

    return html
}

export function RichTextContent({
    content = '',
    className,
    plainTextClassName,
}: RichTextContentProps) {
    const trimmed = content.trim()
    const isRichText = htmlTagPattern.test(trimmed)

    const sanitized = useMemo(() => {
        if (!isRichText || !trimmed) return ''

        const normalized = normalizeHtml(trimmed)

        return DOMPurify.sanitize(normalized, {
            USE_PROFILES: { html: true },

            /* 🔐 Explicitly allow table tags for safety */
            ALLOWED_TAGS: [
                'p',
                'br',
                'strong',
                'b',
                'em',
                'i',
                'u',
                's',
                'ul',
                'ol',
                'li',
                'h1',
                'h2',
                'h3',
                'blockquote',
                'a',
                'table',
                'tbody',
                'thead',
                'tr',
                'td',
                'th',
            ],

            ALLOWED_ATTR: ['href', 'target', 'rel'],
        })
    }, [isRichText, trimmed])

    if (!trimmed) return null

    /* ---------- Plain text ---------- */
    if (!isRichText) {
        return <p className={cn('text-sm whitespace-pre-line', plainTextClassName)}>{content}</p>
    }

    /* ---------- Rich HTML ---------- */
    return (
        <div
            className={cn(
                'text-sm leading-relaxed',

                // links
                '[&_a]:text-primary [&_a]:underline',

                // headings
                '[&_h1]:mt-3 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold',
                '[&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold',
                '[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-semibold',

                // paragraphs
                '[&_p]:mb-2',

                // lists
                '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6',
                '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6',

                // blockquote
                '[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic',

                // 🔥 table styling
                '[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse',
                '[&_thead]:bg-muted/40',
                '[&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold',
                '[&_td]:border [&_td]:px-3 [&_td]:py-2',
                '[&_tr:nth-child(even)]:bg-muted/20',

                className
            )}
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    )
}
