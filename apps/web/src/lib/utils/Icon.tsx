import { FileArchive, FileIcon } from 'lucide-react'
import React, { ElementType } from 'react'
import {
    BsApple,
    BsFiletypeHeic,
    BsFiletypeJson,
    BsFiletypePpt,
    BsFiletypePptx,
    BsFiletypeTsx,
    BsFiletypeTxt,
    BsWindows,
} from 'react-icons/bs'
import { FaAndroid, FaBookReader, FaJava, FaLink } from 'react-icons/fa'
import { IoLogoJavascript, IoMdImage } from 'react-icons/io'
import { MdInstallDesktop, MdRestorePage } from 'react-icons/md'
import { PiBracketsCurlyBold, PiFileJpgBold, PiFilePng } from 'react-icons/pi'
import { Si7Zip, SiHtml5, SiJpeg, SiLg, SiMdx, SiOppo, SiSamsung, SiVuetify } from 'react-icons/si'

import { cn } from '@/lib/utils'
import { Excel, Folder, Gif, Music, Office, Pdf, Play } from '@/ui/icons'

type IconComponent = ElementType
const iconMap: Record<string, IconComponent> = {
    gif: Gif,
    jpeg: SiJpeg,
    jpg: PiFileJpgBold,
    png: PiFilePng,
    heic: BsFiletypeHeic,
    webp: IoMdImage,
    pdf: Pdf,
    doc: Office,
    docx: Office,

    ppt: BsFiletypePpt,
    pptx: BsFiletypePptx,

    xls: Excel,
    xlsx: Excel,

    aac: Music,
    mp3: Music,
    ogg: Music,
    flac: Music,
    oga: Music,
    opus: Music,
    m4a: Music,

    avi: Play,
    flv: Play,
    mkv: Play,
    mp4: Play,

    '7z': Si7Zip,
    bz2: FileArchive,
    xz: FileArchive,
    wim: FileArchive,
    gz: FileArchive,
    rar: FileArchive,
    tar: FileArchive,
    zip: FileArchive,
    tgz: FileArchive,

    c: PiBracketsCurlyBold,
    cpp: PiBracketsCurlyBold,
    js: IoLogoJavascript,
    jsx: PiBracketsCurlyBold,
    java: FaJava,
    sh: PiBracketsCurlyBold,
    cs: PiBracketsCurlyBold,
    py: PiBracketsCurlyBold,
    css: PiBracketsCurlyBold,
    html: SiHtml5,
    ts: PiBracketsCurlyBold,
    tsx: BsFiletypeTsx,
    rs: PiBracketsCurlyBold,
    vue: SiVuetify,
    json: BsFiletypeJson,
    yml: PiBracketsCurlyBold,
    yaml: PiBracketsCurlyBold,
    toml: PiBracketsCurlyBold,

    txt: BsFiletypeTxt,
    rtf: BsFiletypeTxt,
    vtt: BsFiletypeTxt,
    srt: BsFiletypeTxt,
    log: BsFiletypeTxt,
    diff: BsFiletypeTxt,

    md: SiMdx,
    mdx: SiMdx,

    epub: FaBookReader,
    mobi: FaBookReader,
    azw3: FaBookReader,

    url: FaLink,

    ipsw: BsApple,
    dmg: BsApple,
    pkg: BsApple,

    iso: BsWindows,
    img: MdRestorePage,

    exe: MdInstallDesktop,
    msi: MdInstallDesktop,

    apk: FaAndroid,
    pit: SiSamsung,
    ozip: SiOppo,
    ofp: SiOppo,
    kdz: SiLg,
}

interface IconProps {
    name: string
    className?: string
}

const Icon: React.FC<IconProps> = ({ name, className }) => {
    const fileExtension = name.split('.').pop()?.toLowerCase()
    const isFolder = !name.includes('.')
    const IconComponent = isFolder
        ? fileExtension && iconMap[fileExtension]
            ? iconMap[fileExtension]
            : Folder
        : fileExtension && iconMap[fileExtension]
          ? iconMap[fileExtension]
          : FileIcon

    return <IconComponent className={cn('text-muted-foreground', className)} />
}

export default Icon
