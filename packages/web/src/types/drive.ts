export type Thumbnail = {
    id: string
    large?: {
        height: number
        width: number
        url: string
    }
}

export type DriveLink = {
    '@odata.context': string
    id: string
    link: {
        webUrl: string
    }
}

export type DriveItem = {
    [key: string]: unknown
    '@microsoft.graph.downloadUrl': string | undefined
    id: string
    name: string
    eTag: string
    size: number
    createdBy: {
        user: {
            email: string
            id: string
            displayName: string
        }
    }
    lastModifiedDateTime: string
    parentReference: {
        id: string
        path: string
    }
    file: {
        mimeType: string
    }
    folder: {
        childCount: number
    }
    thumbnails: Thumbnail[]
    image: {
        height: number
        width: number
    }
    location: {
        address: {
            city: string
            countryOrRegion: string
            locality: string
            postalCode: string
            state: string
        }
        displayName: string
    }
    photo: {
        cameraMake: string | undefined
        cameraModel: string | undefined
        exposureDenominator: number | undefined
        exposureNumerator: number | undefined
        fNumber: number | undefined
        focalLength: number | undefined
        iso: number | undefined
        orientation: number | string | undefined
        takenDateTime: string | undefined
    }
    video: {
        duration: number
        width: number
        height: number
    }
}

export type Drive = {
    value: DriveItem[]
    '@odata.nextLink'?: string
    status?: 'success' | 'empty' | 'notFound'
}

export type SearchItem = {
    id: string
    name: string
    size: number
    webUrl: string
    file: {
        mimeType: string
    }
    lastModifiedDateTime: string
}

export type Search = {
    value: SearchItem[]
}
