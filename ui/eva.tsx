import React from 'react'
import { Tooltip as TooltipPrimitive, Dialog as DialogPrimitive } from 'radix-ui'
import {
    ArrowUp,
    Paperclip,
    Square,
    X,
    StopCircle,
    Mic,
    Globe,
    BrainCog,
    FolderCode,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ')

// Embedded CSS for minimal custom styles
const styles = `
  *:focus-visible {
    outline-offset: 0 !important;
    --ring-offset: 0 !important;
  }
  textarea::-webkit-scrollbar {
    width: 6px;
  }
  textarea::-webkit-scrollbar-track {
    background: transparent;
  }
  textarea::-webkit-scrollbar-thumb {
    background-color: #444444;
    border-radius: 3px;
  }
  textarea::-webkit-scrollbar-thumb:hover {
    background-color: #555555;
  }
`

// Inject styles into document (client-side only)
const injectStyles = () => {
    if (typeof document !== 'undefined') {
        const styleSheet = document.createElement('style')

        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)
    }
}

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => (
        <textarea
            ref={ref}
            className={cn(
                'scrollbar-thin scrollbar-thumb-[#444444] scrollbar-track-transparent hover:scrollbar-thumb-[#555555] text-muted-foreground flex min-h-11 w-full resize-none rounded-md border-none bg-transparent px-3 py-2.5 text-base placeholder:text-gray-400 focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            rows={1}
            {...props}
        />
    )
)

Textarea.displayName = 'Textarea'

// Tooltip Components
const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        className={cn(
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border border-[#333333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md',
            className
        )}
        sideOffset={sideOffset}
        {...props}
    />
))

TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Dialog Components
const Dialog = DialogPrimitive.Root
const DialogPortal = DialogPrimitive.Portal
const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
            className
        )}
        {...props}
    />
))

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[90vw] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border border-[#333333] bg-[#1F2023] p-0 shadow-xl duration-300 md:max-w-[800px]',
                className
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className='absolute top-4 right-4 z-10 rounded-full bg-[#2E3033]/80 p-2 transition-all hover:bg-[#2E3033]'>
                <X className='h-5 w-5 text-gray-200 hover:text-white' />
                <span className='sr-only'>Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
))

DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn('text-lg leading-none font-semibold tracking-tight text-gray-100', className)}
        {...props}
    />
))

DialogTitle.displayName = DialogPrimitive.Title.displayName

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const variantClasses = {
            default: 'bg-white hover:bg-white/80 text-black',
            outline: 'border border-[#444444] bg-transparent hover:bg-[#3A3A40]',
            ghost: 'bg-transparent hover:bg-[#3A3A40]',
        }
        const sizeClasses = {
            default: 'h-10 px-4 py-2',
            sm: 'h-8 px-3 text-sm',
            lg: 'h-12 px-6',
            icon: 'h-8 w-8 rounded-full aspect-[1/1]',
        }

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'

// VoiceRecorder Component
interface VoiceRecorderProps {
    isRecording: boolean
    onStartRecording: () => void
    onStopRecording: (duration: number) => void
    visualizerBars?: number
}
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
    isRecording,
    onStartRecording,
    onStopRecording,
    visualizerBars = 32,
}) => {
    const [time, setTime] = React.useState(0)
    const timerRef = React.useRef<NodeJS.Timeout | null>(null)

    React.useEffect(() => {
        if (isRecording) {
            onStartRecording()
            timerRef.current = setInterval(() => setTime((t) => t + 1), 1000)
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            onStopRecording(time)
            setTime(0)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isRecording, time, onStartRecording, onStopRecording])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60

        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div
            className={cn(
                'flex w-full flex-col items-center justify-center py-3 transition-all duration-300',
                isRecording ? 'opacity-100' : 'h-0 opacity-0'
            )}
        >
            <div className='mb-3 flex items-center gap-2'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
                <span className='font-mono text-sm text-white/80'>{formatTime(time)}</span>
            </div>
            <div className='flex h-10 w-full items-center justify-center gap-0.5 px-4'>
                {[...Array(visualizerBars)].map((_, i) => (
                    <div
                        key={i}
                        className='w-0.5 animate-pulse rounded-full bg-white/50'
                        style={{
                            height: `${Math.max(15, Math.random() * 100)}%`,
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

// ImageViewDialog Component
interface ImageViewDialogProps {
    imageUrl: string | null
    onClose: () => void
}
const ImageViewDialog: React.FC<ImageViewDialogProps> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null

    return (
        <Dialog open={!!imageUrl} onOpenChange={onClose}>
            <DialogContent className='max-w-[90vw] border-none bg-transparent p-0 shadow-none md:max-w-[800px]'>
                <DialogTitle className='sr-only'>Image Preview</DialogTitle>
                <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className='relative overflow-hidden rounded-2xl bg-[#1F2023] shadow-2xl'
                    exit={{ opacity: 0, scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                    <img
                        alt='Full preview'
                        className='max-h-[80vh] w-full rounded-2xl object-contain'
                        src={imageUrl}
                    />
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}

// PromptInput Context and Components
interface PromptInputContextType {
    isLoading: boolean
    value: string
    setValue: (value: string) => void
    maxHeight: number | string
    onSubmit?: () => void
    disabled?: boolean
}
const PromptInputContext = React.createContext<PromptInputContextType>({
    isLoading: false,
    value: '',
    setValue: () => {},
    maxHeight: 240,
    onSubmit: undefined,
    disabled: false,
})

function usePromptInput() {
    const context = React.useContext(PromptInputContext)

    if (!context) throw new Error('usePromptInput must be used within a PromptInput')

    return context
}

interface PromptInputProps {
    isLoading?: boolean
    value?: string
    onValueChange?: (value: string) => void
    maxHeight?: number | string
    onSubmit?: () => void
    children: React.ReactNode
    className?: string
    disabled?: boolean
    onDragOver?: (e: React.DragEvent) => void
    onDragLeave?: (e: React.DragEvent) => void
    onDrop?: (e: React.DragEvent) => void
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
    (
        {
            className,
            isLoading = false,
            maxHeight = 240,
            value,
            onValueChange,
            onSubmit,
            children,
            disabled = false,
            onDragOver,
            onDragLeave,
            onDrop,
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = React.useState(value || '')
        const handleChange = (newValue: string) => {
            setInternalValue(newValue)
            onValueChange?.(newValue)
        }

        return (
            <TooltipProvider>
                <PromptInputContext.Provider
                    value={{
                        isLoading,
                        value: value ?? internalValue,
                        setValue: onValueChange ?? handleChange,
                        maxHeight,
                        onSubmit,
                        disabled,
                    }}
                >
                    <div
                        ref={ref}
                        className={cn(
                            'bg-background rounded-3xl border p-2 transition-all duration-300',
                            isLoading && 'border-red-500/70',
                            className
                        )}
                        onDragLeave={onDragLeave}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                    >
                        {children}
                    </div>
                </PromptInputContext.Provider>
            </TooltipProvider>
        )
    }
)

PromptInput.displayName = 'PromptInput'

interface PromptInputTextareaProps {
    disableAutosize?: boolean
    placeholder?: string
}
const PromptInputTextarea: React.FC<
    PromptInputTextareaProps & React.ComponentProps<typeof Textarea>
> = ({ className, onKeyDown, disableAutosize = false, placeholder, ...props }) => {
    const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput()
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useEffect(() => {
        if (disableAutosize || !textareaRef.current) return
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height =
            typeof maxHeight === 'number'
                ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
                : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`
    }, [value, maxHeight, disableAutosize])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSubmit?.()
        }
        onKeyDown?.(e)
    }

    return (
        <Textarea
            ref={textareaRef}
            className={cn('text-base', className)}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            {...props}
        />
    )
}

const PromptInputActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => (
    <div className={cn('flex items-center gap-2', className)} {...props}>
        {children}
    </div>
)

interface PromptInputActionProps extends React.ComponentProps<typeof Tooltip> {
    tooltip: React.ReactNode
    children: React.ReactNode
    side?: 'top' | 'bottom' | 'left' | 'right'
    className?: string
}
const PromptInputAction: React.FC<PromptInputActionProps> = ({
    tooltip,
    children,
    className,
    side = 'top',
    ...props
}) => {
    const { disabled } = usePromptInput()

    return (
        <Tooltip {...props}>
            <TooltipTrigger asChild disabled={disabled}>
                {children}
            </TooltipTrigger>
            <TooltipContent className={className} side={side}>
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
}

// Custom Divider Component
const CustomDivider: React.FC = () => (
    <div className='relative mx-1 h-6 w-[1.5px]'>
        <div
            className='absolute inset-0 rounded-full bg-linear-to-t from-transparent via-[#9b87f5]/70 to-transparent'
            style={{
                clipPath:
                    'polygon(0% 0%, 100% 0%, 100% 40%, 140% 50%, 100% 60%, 100% 100%, 0% 100%, 0% 60%, -40% 50%, 0% 40%)',
            }}
        />
    </div>
)

// Main PromptInputBox Component
interface EvaProps {
    onSend?: (message: string, files?: File[]) => void
    isLoading?: boolean
    placeholder?: string
    className?: string
}
export const Eva = React.forwardRef((props: EvaProps, ref: React.Ref<HTMLDivElement>) => {
    const {
        onSend = () => {},
        isLoading = false,
        placeholder = 'Type your message here...',
        className,
    } = props

    // Inject styles on client-side only
    React.useEffect(() => {
        injectStyles()
    }, [])
    const [input, setInput] = React.useState('')
    const [files, setFiles] = React.useState<File[]>([])
    const [filePreviews, setFilePreviews] = React.useState<{ [key: string]: string }>({})
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
    const [isRecording, setIsRecording] = React.useState(false)
    const [showSearch, setShowSearch] = React.useState(false)
    const [showThink, setShowThink] = React.useState(false)
    const [showCanvas, setShowCanvas] = React.useState(false)
    const uploadInputRef = React.useRef<HTMLInputElement>(null)
    const promptBoxRef = React.useRef<HTMLDivElement>(null)

    const handleToggleChange = (value: string) => {
        if (value === 'search') {
            setShowSearch((prev) => !prev)
            setShowThink(false)
        } else if (value === 'think') {
            setShowThink((prev) => !prev)
            setShowSearch(false)
        }
    }

    const handleCanvasToggle = () => setShowCanvas((prev) => !prev)

    const isImageFile = (file: File) => file.type.startsWith('image/')

    const processFile = (file: File) => {
        if (!isImageFile(file)) {
            // Only image files are allowed
            // TODO: Show user-friendly error message (e.g., toast)
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            // File too large (max 10MB)
            // TODO: Show user-friendly error message (e.g., toast)
            return
        }
        setFiles([file])
        const reader = new FileReader()

        reader.onload = (e) => setFilePreviews({ [file.name]: e.target?.result as string })
        reader.readAsDataURL(file)
    }

    const handleDragOver = React.useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = React.useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const files = Array.from(e.dataTransfer.files)
        const imageFiles = files.filter((file) => isImageFile(file))

        if (imageFiles.length > 0) processFile(imageFiles[0])
    }, [])

    const handleRemoveFile = (index: number) => {
        const fileToRemove = files[index]

        if (fileToRemove && filePreviews[fileToRemove.name]) setFilePreviews({})
        setFiles([])
    }

    const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl)

    const handlePaste = React.useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items

        if (!items) return
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile()

                if (file) {
                    e.preventDefault()
                    processFile(file)
                    break
                }
            }
        }
    }, [])

    React.useEffect(() => {
        document.addEventListener('paste', handlePaste)

        return () => document.removeEventListener('paste', handlePaste)
    }, [handlePaste])

    const handleSubmit = () => {
        if (input.trim() || files.length > 0) {
            let messagePrefix = ''

            if (showSearch) messagePrefix = '[Search: '
            else if (showThink) messagePrefix = '[Think: '
            else if (showCanvas) messagePrefix = '[Canvas: '
            const formattedInput = messagePrefix ? `${messagePrefix}${input}]` : input

            onSend(formattedInput, files)
            setInput('')
            setFiles([])
            setFilePreviews({})
        }
    }

    const handleStartRecording = () => {
        /* Started recording */
    }

    const handleStopRecording = (duration: number) => {
        /* Stopped recording after duration seconds */
        setIsRecording(false)
        onSend(`[Voice message - ${duration} seconds]`, [])
    }

    const hasContent = input.trim() !== '' || files.length > 0

    return (
        <>
            <PromptInput
                ref={ref || promptBoxRef}
                className={cn('bg-default/20', isRecording && 'border-red-500/70', className)}
                disabled={isLoading || isRecording}
                isLoading={isLoading}
                value={input}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onSubmit={handleSubmit}
                onValueChange={setInput}
            >
                {files.length > 0 && !isRecording && (
                    <div className='flex flex-wrap gap-2 p-0 pb-1 transition-all duration-300'>
                        {files.map((file, index) => (
                            <div key={index} className='group relative'>
                                {file.type.startsWith('image/') && filePreviews[file.name] && (
                                    <div
                                        className='h-16 w-16 cursor-pointer overflow-hidden rounded-xl transition-all duration-300'
                                        tabIndex={0} // for keyboard accessibility
                                        onClick={() => openImageModal(filePreviews[file.name])}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                openImageModal(filePreviews[file.name])
                                            }
                                        }}
                                    >
                                        <img
                                            alt={file.name}
                                            className='h-full w-full object-cover'
                                            src={filePreviews[file.name]}
                                        />
                                        <button
                                            className='absolute top-1 right-1 rounded-full bg-black/70 p-0.5 opacity-100 transition-opacity'
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleRemoveFile(index)
                                            }}
                                        >
                                            <X className='h-3 w-3 text-white' />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div
                    className={cn(
                        'transition-all duration-300',
                        isRecording ? 'h-0 overflow-hidden opacity-0' : 'opacity-100'
                    )}
                >
                    <PromptInputTextarea
                        className='text-base'
                        placeholder={
                            showSearch
                                ? 'Search the web...'
                                : showThink
                                  ? 'Think deeply...'
                                  : showCanvas
                                    ? 'Create on canvas...'
                                    : placeholder
                        }
                    />
                </div>

                {isRecording && (
                    <VoiceRecorder
                        isRecording={isRecording}
                        onStartRecording={handleStartRecording}
                        onStopRecording={handleStopRecording}
                    />
                )}

                <PromptInputActions className='flex items-center justify-between gap-2 p-0 pt-2'>
                    <div
                        className={cn(
                            'flex items-center gap-1 transition-opacity duration-300',
                            isRecording ? 'invisible h-0 opacity-0' : 'visible opacity-100'
                        )}
                    >
                        <PromptInputAction tooltip='Upload image'>
                            <button
                                className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-gray-600/30 hover:text-[#D1D5DB]'
                                disabled={isRecording}
                                onClick={() => uploadInputRef.current?.click()}
                            >
                                <Paperclip className='h-5 w-5 transition-colors' />
                                <input
                                    ref={uploadInputRef}
                                    accept='image/*'
                                    className='hidden'
                                    type='file'
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0)
                                            processFile(e.target.files[0])
                                        if (e.target) e.target.value = ''
                                    }}
                                />
                            </button>
                        </PromptInputAction>

                        <div className='flex items-center'>
                            <button
                                className={cn(
                                    'flex h-8 items-center gap-1 rounded-full border px-2 py-1 transition-all',
                                    showSearch
                                        ? 'border-[#1EAEDB] bg-[#1EAEDB]/15 text-[#1EAEDB]'
                                        : 'border-transparent bg-transparent text-[#9CA3AF] hover:text-[#D1D5DB]'
                                )}
                                type='button'
                                onClick={() => handleToggleChange('search')}
                            >
                                <div className='flex h-5 w-5 shrink-0 items-center justify-center'>
                                    <motion.div
                                        animate={{
                                            rotate: showSearch ? 360 : 0,
                                            scale: showSearch ? 1.1 : 1,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 25,
                                        }}
                                        whileHover={{
                                            rotate: showSearch ? 360 : 15,
                                            scale: 1.1,
                                            transition: {
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 10,
                                            },
                                        }}
                                    >
                                        <Globe
                                            className={cn(
                                                'h-4 w-4',
                                                showSearch ? 'text-[#1EAEDB]' : 'text-inherit'
                                            )}
                                        />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {showSearch && (
                                        <motion.span
                                            animate={{ width: 'auto', opacity: 1 }}
                                            className='shrink-0 overflow-hidden text-xs whitespace-nowrap text-[#1EAEDB]'
                                            exit={{ width: 0, opacity: 0 }}
                                            initial={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            Search
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>

                            <CustomDivider />

                            <button
                                className={cn(
                                    'flex h-8 items-center gap-1 rounded-full border px-2 py-1 transition-all',
                                    showThink
                                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 text-[#8B5CF6]'
                                        : 'border-transparent bg-transparent text-[#9CA3AF] hover:text-[#D1D5DB]'
                                )}
                                type='button'
                                onClick={() => handleToggleChange('think')}
                            >
                                <div className='flex h-5 w-5 shrink-0 items-center justify-center'>
                                    <motion.div
                                        animate={{
                                            rotate: showThink ? 360 : 0,
                                            scale: showThink ? 1.1 : 1,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 25,
                                        }}
                                        whileHover={{
                                            rotate: showThink ? 360 : 15,
                                            scale: 1.1,
                                            transition: {
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 10,
                                            },
                                        }}
                                    >
                                        <BrainCog
                                            className={cn(
                                                'h-4 w-4',
                                                showThink ? 'text-[#8B5CF6]' : 'text-inherit'
                                            )}
                                        />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {showThink && (
                                        <motion.span
                                            animate={{ width: 'auto', opacity: 1 }}
                                            className='shrink-0 overflow-hidden text-xs whitespace-nowrap text-[#8B5CF6]'
                                            exit={{ width: 0, opacity: 0 }}
                                            initial={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            Think
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>

                            <CustomDivider />

                            <button
                                className={cn(
                                    'flex h-8 items-center gap-1 rounded-full border px-2 py-1 transition-all',
                                    showCanvas
                                        ? 'border-[#F97316] bg-[#F97316]/15 text-[#F97316]'
                                        : 'border-transparent bg-transparent text-[#9CA3AF] hover:text-[#D1D5DB]'
                                )}
                                type='button'
                                onClick={handleCanvasToggle}
                            >
                                <div className='flex h-5 w-5 shrink-0 items-center justify-center'>
                                    <motion.div
                                        animate={{
                                            rotate: showCanvas ? 360 : 0,
                                            scale: showCanvas ? 1.1 : 1,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 25,
                                        }}
                                        whileHover={{
                                            rotate: showCanvas ? 360 : 15,
                                            scale: 1.1,
                                            transition: {
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 10,
                                            },
                                        }}
                                    >
                                        <FolderCode
                                            className={cn(
                                                'h-4 w-4',
                                                showCanvas ? 'text-[#F97316]' : 'text-inherit'
                                            )}
                                        />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {showCanvas && (
                                        <motion.span
                                            animate={{ width: 'auto', opacity: 1 }}
                                            className='shrink-0 overflow-hidden text-xs whitespace-nowrap text-[#F97316]'
                                            exit={{ width: 0, opacity: 0 }}
                                            initial={{ width: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            Canvas
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>

                    <PromptInputAction
                        tooltip={
                            isLoading
                                ? 'Stop generation'
                                : isRecording
                                  ? 'Stop recording'
                                  : hasContent
                                    ? 'Send message'
                                    : 'Voice message'
                        }
                    >
                        <Button
                            className={cn(
                                'h-8 w-8 rounded-full transition-all duration-200',
                                isRecording
                                    ? 'bg-transparent text-red-500 hover:bg-gray-600/30 hover:text-red-400'
                                    : hasContent
                                      ? 'bg-white text-[#1F2023] hover:bg-white/80'
                                      : 'bg-transparent text-[#9CA3AF] hover:bg-gray-600/30 hover:text-[#D1D5DB]'
                            )}
                            disabled={isLoading && !hasContent}
                            size='icon'
                            variant='default'
                            onClick={() => {
                                if (isRecording) setIsRecording(false)
                                else if (hasContent) handleSubmit()
                                else setIsRecording(true)
                            }}
                        >
                            {isLoading ? (
                                <Square className='h-4 w-4 animate-pulse fill-[#1F2023]' />
                            ) : isRecording ? (
                                <StopCircle className='h-5 w-5 text-red-500' />
                            ) : hasContent ? (
                                <ArrowUp className='h-4 w-4 text-[#1F2023]' />
                            ) : (
                                <Mic className='h-5 w-5 text-[#1F2023] transition-colors' />
                            )}
                        </Button>
                    </PromptInputAction>
                </PromptInputActions>
            </PromptInput>

            <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
        </>
    )
})
Eva.displayName = 'Eva'
