'use client'

import { cn } from '@/lib/utils'
import { Button } from '@heroui/react'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Eraser,
    Underline as UnderlineIcon,
    Strikethrough,
    Pilcrow,
    Heading1,
    Heading2,
    Heading3,
    Link2,
    Unlink,
} from 'lucide-react'
import { ReactNode, useEffect, useRef } from 'react'

interface Props {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}
interface ToolbarButtonProps {
    icon: ReactNode
    isActive?: boolean
    onPress: () => void
    disabled?: boolean
    title: string
}

const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const convertTabTextToTable = (text: string) => {
    if (!text.includes('\t')) return null

    const rows = text.split('\n').filter(Boolean)

    let html = '<table><tbody>'
    for (const row of rows) {
        html += '<tr>'
        row.split('\t').forEach((cell) => {
            html += `<td><p>${escapeHtml(cell.trim())}</p></td>`
        })
        html += '</tr>'
    }
    html += '</tbody></table>'

    return html
}
function ToolbarButton({ icon, isActive, onPress, disabled, title }: ToolbarButtonProps) {
    return (
        <Button
            isIconOnly
            size='sm'
            variant='light'
            aria-label={title}
            title={title}
            className={cn('h-8 w-8 min-w-0 border', isActive ? 'bg-default-200' : 'bg-transparent')}
            isDisabled={disabled}
            onPress={onPress}
        >
            {icon}
        </Button>
    )
}

export function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Write description...',
    className,
}: Props) {
    const lastValueRef = useRef(value)

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || '<p></p>',
        editorProps: {
            attributes: {
                class: cn(
                    'min-h-[120px] w-full rounded-b-xl border border-t-0 px-3 py-2 text-sm outline-none',

                    // table styles
                    '[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse',
                    '[&_td]:border [&_td]:px-3 [&_td]:py-2',
                    '[&_th]:bg-muted [&_th]:border [&_th]:px-3 [&_th]:py-2'
                ),
            },

            handlePaste(view, event) {
                const clipboard = event.clipboardData
                if (!clipboard) return false

                const html = clipboard.getData('text/html')

                // 🔥 Fix broken HTML tables (tr/td without table)
                if (html?.includes('<td') || html?.includes('<tr')) {
                    event.preventDefault()

                    const wrapped = html.includes('<table')
                        ? html
                        : `<table><tbody>${html}</tbody></table>`

                    const dom = new DOMParser().parseFromString(wrapped, 'text/html')
                    const parser = ProseMirrorDOMParser.fromSchema(view.state.schema)
                    const slice = parser.parseSlice(dom.body)
                    view.dispatch(view.state.tr.replaceSelection(slice))
                    return true
                }

                // 🔥 Convert tab text
                const text = clipboard.getData('text/plain')
                const tableFromText = convertTabTextToTable(text)

                if (tableFromText) {
                    event.preventDefault()
                    const dom = new DOMParser().parseFromString(tableFromText, 'text/html')
                    const parser = ProseMirrorDOMParser.fromSchema(view.state.schema)
                    const slice = parser.parseSlice(dom.body)
                    view.dispatch(view.state.tr.replaceSelection(slice))
                    return true
                }

                return false
            },
        },

        onUpdate: ({ editor }) => {
            const html = editor.isEmpty ? '' : editor.getHTML()
            lastValueRef.current = html
            onChange(html)
        },
    })

    useEffect(() => {
        if (!editor) return
        const nextValue = value || ''
        if (nextValue === lastValueRef.current) return
        lastValueRef.current = nextValue
        editor.commands.setContent(nextValue || '<p></p>', { emitUpdate: false })
    }, [editor, value])

    const setLink = () => {
        if (!editor) return
        const previous = editor.getAttributes('link').href as string | undefined
        const url = window.prompt('Enter URL', previous || 'https://')
        if (url === null) return

        const trimmed = url.trim()
        if (!trimmed) {
            editor.chain().focus().unsetLink().run()
            return
        }

        editor.chain().focus().setLink({ href: trimmed }).run()
    }

    if (!editor) return null

    return (
        <div className={cn('rounded-xl', className)}>
            <div className='bg-background flex flex-wrap items-center gap-2 rounded-t-xl border px-2 py-2'>
                <ToolbarButton
                    icon={<Bold size={14} />}
                    title='Bold'
                    isActive={editor.isActive('bold')}
                    onPress={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                />
                <ToolbarButton
                    icon={<Italic size={14} />}
                    title='Italic'
                    isActive={editor.isActive('italic')}
                    onPress={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                />
                <ToolbarButton
                    icon={<UnderlineIcon size={14} />}
                    title='Underline'
                    isActive={editor.isActive('underline')}
                    onPress={() => editor.chain().focus().toggleUnderline().run()}
                    disabled={!editor.can().chain().focus().toggleUnderline().run()}
                />
                <ToolbarButton
                    icon={<Strikethrough size={14} />}
                    title='Strike'
                    isActive={editor.isActive('strike')}
                    onPress={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                />
                <ToolbarButton
                    icon={<Pilcrow size={14} />}
                    title='Paragraph'
                    isActive={editor.isActive('paragraph')}
                    onPress={() => editor.chain().focus().setParagraph().run()}
                />
                <ToolbarButton
                    icon={<Heading1 size={14} />}
                    title='Large Text'
                    isActive={editor.isActive('heading', { level: 1 })}
                    onPress={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                />
                <ToolbarButton
                    icon={<Heading2 size={14} />}
                    title='Medium Heading'
                    isActive={editor.isActive('heading', { level: 2 })}
                    onPress={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                />
                <ToolbarButton
                    icon={<Heading3 size={14} />}
                    title='Small Heading'
                    isActive={editor.isActive('heading', { level: 3 })}
                    onPress={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                />
                <ToolbarButton
                    icon={<List size={14} />}
                    title='Bullet List'
                    isActive={editor.isActive('bulletList')}
                    onPress={() => editor.chain().focus().toggleBulletList().run()}
                />
                <ToolbarButton
                    icon={<ListOrdered size={14} />}
                    title='Numbered List'
                    isActive={editor.isActive('orderedList')}
                    onPress={() => editor.chain().focus().toggleOrderedList().run()}
                />
                <ToolbarButton
                    icon={<Link2 size={14} />}
                    title='Add Link'
                    isActive={editor.isActive('link')}
                    onPress={setLink}
                />
                <ToolbarButton
                    icon={<Unlink size={14} />}
                    title='Remove Link'
                    onPress={() => editor.chain().focus().unsetLink().run()}
                    disabled={!editor.isActive('link')}
                />
                <ToolbarButton
                    icon={<Eraser size={14} />}
                    title='Clear Formatting'
                    onPress={() =>
                        editor.chain().focus().clearNodes().unsetAllMarks().setParagraph().run()
                    }
                />
            </div>

            <EditorContent editor={editor} />
        </div>
    )
}
