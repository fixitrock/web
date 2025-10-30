import { ProductsCard } from './card'

interface ProductsProps {
    params: {
        user: string
    }
}

export default async function Products({ params }: ProductsProps) {
    return (
        <div className='mb-4 flex h-full w-full flex-col gap-4 px-2 md:px-4 2xl:px-[10%]'>
             <ProductsCard />
        </div>
    )
}
