'use server'

import { R2 } from '@/supabase/r2'
import { createClient } from '@/supabase/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function generateUploadUrls(productSlug: string, files: File[]) {
    const supabase = await createClient()
    const { data: userDetails, error: userError } = await supabase.rpc('get_current_user_details')
    if (userError || !userDetails) throw new Error('Failed to fetch user details')
    const username = userDetails.username

    const baseTs = Date.now()

    return await Promise.all(
        files.map(async (file, i) => {
            const key = `@${username}/products/${productSlug}/${baseTs + i}.png`
            const command = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key,
                ContentType: file.type,
            })
            const signedUrl = await getSignedUrl(R2, command, { expiresIn: 60 })
            return { signedUrl, path: `/${key}` }
        })
    )
}
