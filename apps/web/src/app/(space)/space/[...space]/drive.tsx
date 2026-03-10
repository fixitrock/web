import { getChildren, getReadme } from '@/actions/drive'
import { SortField, SortOrder } from '@/types/drive'
import { Readme } from '@/app/(space)/ui/preview/readme'

import { Data } from './data'
interface Props {
    space: string
    query: string
    sortField?: SortField
    sortOrder?: SortOrder
    layout: 'grid' | 'list'
}
export async function DriveGrid({ space, ...props }: Props) {
    const initial = await getChildren(`/${space}`, undefined, 50)
    const raw = await getReadme(`/${space}`)

    return (
        <>
            <Data
                initial={{ ...initial, nextPage: initial['@odata.nextLink'] }}
                space={space}
                {...props}
            />
            <Readme className='rounded-lg border p-2' raw={raw || ''} />
        </>
    )
}
