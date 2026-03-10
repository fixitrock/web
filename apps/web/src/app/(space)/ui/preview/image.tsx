'use client'

import { Image } from '@heroui/react'
import { FC } from 'react'

import { DriveItem } from '@/types/drive'

const ImagePreview: FC<{ file: DriveItem }> = ({ file }) => {
    const src =
        file.file?.mimeType === 'image/heic'
            ? file.thumbnails?.[0]?.large?.url
            : file['@microsoft.graph.downloadUrl']

    return (
        <Image
            // isBlurred
            alt={file.name}
            className='object-contain p-0.5'
            classNames={{ img: 'max-h-[60vh]!', wrapper: 'mx-auto' }}
            height={file.thumbnails?.[0]?.large?.height}
            loading='lazy'
            src={src}
            width={file.thumbnails?.[0]?.large?.width}
        />
    )
}

export default ImagePreview
