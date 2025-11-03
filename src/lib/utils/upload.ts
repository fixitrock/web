'use client'

import { createClient } from '@/supabase/client'

async function createSignedUrlForPath(path: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('user')
    .createSignedUploadUrl(path)

  if (error || !data?.signedUrl)
    throw error || new Error('Failed to create signed upload URL')

  return data.signedUrl
}

export async function uploadVariantImagesSigned(
  slug: string,
  username: string,
  files: File[]
) {
  const uploaded: string[] = []

  for (const file of files.slice(0, 3)) {
    const ext = file.name.split('.').pop() || 'png'
    const filename = `${Date.now()}.${ext}`
    const path = `@${username}/products/${slug}/${filename}`

    const signedUrl = await createSignedUrlForPath(path)

    const res = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!res.ok) throw new Error(`Failed to upload ${file.name}`)

    uploaded.push(`/user/${path}`)
  }

  return uploaded
}