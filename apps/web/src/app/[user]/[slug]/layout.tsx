export default async function SlugLayout({
    children,
    modal,
}: {
    children: React.ReactNode
    modal: React.ReactNode
}) {
    return (
        <>
            {children}
            {modal}
        </>
    )
}
