'use client'

export async function uploadFilesDirectly(uploads: { signedUrl: string; file: File }[]) {
    await Promise.all(
        uploads.map(async ({ signedUrl, file }) => {
            const res = await fetch(signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
                mode: 'cors',
            })
            if (!res.ok) throw new Error(`Upload failed for ${file.name}`)
        })
    )
}
