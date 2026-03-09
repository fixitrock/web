// 'use client'

// import { useState } from 'react'
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
// import { useTheme } from 'next-themes'
// import { Copy, Check, FileText, Code2 } from 'lucide-react'
// import { Badge, Button } from '@heroui/react'

// import { cn } from '@/lib/utils'

// interface CodeBlockProps {
//     children?: string
//     className?: string
//     title?: string
//     showLineNumbers?: boolean
//     highlightLines?: number[]
//     filename?: string
//     language?: string
//     maxHeight?: string
//     wrapLines?: boolean
// }

// export function CodeBlock({
//     children = '',
//     className = '',
//     title,
//     showLineNumbers = true,
//     highlightLines = [],
//     filename,
//     language,
//     maxHeight = '500px',
//     wrapLines = false,
//     ...props
// }: CodeBlockProps) {
//     const [copied, setCopied] = useState(false)
//     const { theme } = useTheme()

//     // Extract language from className (e.g., "language-javascript" -> "javascript")
//     const lang = language || className.replace(/language-/, '') || 'text'

//     const copyToClipboard = async () => {
//         try {
//             await navigator.clipboard.writeText(children)
//             setCopied(true)
//             setTimeout(() => setCopied(false), 2000)
//         } catch (err) {
//             console.error('Failed to copy:', err)
//         }
//     }

//     const displayTitle = title || filename
//     const isDark = theme === 'dark'

//     const getLanguageIcon = (language: string) => {
//         switch (language.toLowerCase()) {
//             case 'javascript':
//             case 'js':
//             case 'typescript':
//             case 'ts':
//                 return <Code2 className='h-4 w-4 text-yellow-500' />
//             case 'python':
//             case 'py':
//                 return <Code2 className='h-4 w-4 text-blue-500' />
//             case 'sql':
//                 return <Code2 className='h-4 w-4 text-orange-500' />
//             case 'json':
//                 return <Code2 className='h-4 w-4 text-green-500' />
//             default:
//                 return <Code2 className='text-muted-foreground h-4 w-4' />
//         }
//     }

//     return (
//         <div className='group relative my-6'>
//             {/* Header with title and controls */}
//             {(displayTitle || lang !== 'text') && (
//                 <div className='bg-muted/50 flex items-center justify-between rounded-t-lg border border-b-0 px-4 py-3'>
//                     <div className='flex items-center gap-3'>
//                         {displayTitle && (
//                             <div className='flex items-center gap-2'>
//                                 <FileText className='text-muted-foreground h-4 w-4' />
//                                 <span className='text-foreground text-sm font-medium'>
//                                     {displayTitle}
//                                 </span>
//                             </div>
//                         )}
//                         {lang !== 'text' && (
//                             <div className='flex items-center gap-2'>
//                                 {getLanguageIcon(lang)}
//                                 <Badge className='font-mono text-xs'>{lang.toUpperCase()}</Badge>
//                             </div>
//                         )}
//                     </div>

//                     <Button
//                         className='hover:bg-background/80 opacity-0 transition-all duration-200 group-hover:opacity-100'
//                         size='sm'
//                         title='Copy to clipboard'
//                         variant='ghost'
//                         onClick={copyToClipboard}
//                     >
//                         {copied ? (
//                             <Check className='h-4 w-4 text-green-500' />
//                         ) : (
//                             <Copy className='h-4 w-4' />
//                         )}
//                         <span className='ml-1 text-xs'>{copied ? 'Copied!' : 'Copy'}</span>
//                     </Button>
//                 </div>
//             )}

//             {/* Code content */}
//             <div
//                 className={cn(
//                     'bg-background/50 relative overflow-auto rounded-lg border',
//                     displayTitle || lang !== 'text' ? 'rounded-t-none border-t-0' : ''
//                 )}
//                 style={{ maxHeight }}
//             >
//                 <SyntaxHighlighter
//                     codeTagProps={{
//                         style: {
//                             fontFamily:
//                                 'var(--font-mono), "Fira Code", Consolas, Monaco, "Courier New", monospace',
//                             fontWeight: '400',
//                         },
//                     }}
//                     customStyle={{
//                         margin: 0,
//                         padding: '1.5rem',
//                         background: 'transparent',
//                         fontSize: '0.875rem',
//                         lineHeight: '1.6',
//                     }}
//                     language={lang}
//                     lineProps={(lineNumber: number) => ({
//                         style: {
//                             backgroundColor: highlightLines.includes(lineNumber)
//                                 ? isDark
//                                     ? 'rgba(255, 255, 255, 0.1)'
//                                     : 'rgba(0, 0, 0, 0.05)'
//                                 : 'transparent',
//                             display: 'block',
//                             width: '100%',
//                         },
//                     })}
//                     showLineNumbers={showLineNumbers}
//                     style={isDark ? oneDark : oneLight}
//                     wrapLines={wrapLines}
//                     wrapLongLines={wrapLines}
//                     {...props}
//                 >
//                     {children}
//                 </SyntaxHighlighter>

//                 {/* Copy button for code blocks without headers */}
//                 {!displayTitle && lang === 'text' && (
//                     <Button
//                         className='bg-background/90 hover:bg-background absolute top-3 right-3 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100'
//                         size='sm'
//                         title='Copy to clipboard'
//                         variant='ghost'
//                         onClick={copyToClipboard}
//                     >
//                         {copied ? (
//                             <Check className='h-4 w-4 text-green-500' />
//                         ) : (
//                             <Copy className='h-4 w-4' />
//                         )}
//                     </Button>
//                 )}
//             </div>
//         </div>
//     )
// }
