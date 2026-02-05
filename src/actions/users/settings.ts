'use server'

import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

import { createClient } from '@/supabase/server'
import { logWarning } from '@/lib/utils'
import { userSession } from '@/actions/user'
import { R2 } from '@/supabase/r2'

const SettingsSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    gender: z.string().optional(),
    dob: z.string().optional(),
    location: z.string().optional(),
    location_url: z.string().optional(),
    bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
})

const LOCATION_EDIT_ROLES = [2, 3]

export async function updateUser(formData: FormData) {
    const session = await userSession()
    const user = session.user

    if (!user) {
        throw new Error('Not authenticated')
    }
    const supabase = await createClient()

    try {
        const data = Object.fromEntries(formData.entries())
        const validatedData = SettingsSchema.parse(data)

        // Only allow location/location_url update for allowed roles
        const updateObj: Record<string, string | null | Date> = {
            name: validatedData.name,
            gender: validatedData.gender || null,
            dob: validatedData.dob ? new Date(validatedData.dob) : null,
            bio: validatedData.bio || null,
            updated_at: new Date().toISOString(),
        }

        if (typeof user.role === 'number' && LOCATION_EDIT_ROLES.includes(user.role)) {
            updateObj.location = validatedData.location || null
            updateObj.location_url = validatedData.location_url || null
        }

        const { error } = await supabase.from('users').update(updateObj).eq('id', user.id)

        if (error) throw error
        await revalidatePath('/[user]/[slug]/settings', 'layout')

        const { data: updatedUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (fetchError) throw fetchError

        return { success: true, user: updatedUser }
    } catch (error) {
        logWarning('Error updating user:', error)
        throw new Error('Failed to update user')
    }
}
const AVATAR_SIZES = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512] as const

export async function uploadUserImage(file: File, type: 'avatar' | 'cover') {
    const session = await userSession()
    const user = session.user

    if (!user) throw new Error('Not authenticated')

    const supabase = await createClient()

    try {
        const arrayBuffer = await file.arrayBuffer()
        const inputBuffer = Buffer.from(arrayBuffer)
        const fileName = `${type}.png`
        const storagePath = `@${user.username}/${fileName}`
        const tablePath = `/@${user.username}/${fileName}`

        if (type === 'avatar') {
            const base = sharp(inputBuffer).rotate()
            const uploads = AVATAR_SIZES.map(async (size) => {
                const pngBuffer = await base
                    .clone()
                    .resize(size, size, { fit: 'cover' })
                    .png()
                    .toBuffer()
                const key = size === 512 ? storagePath : `@${user.username}/avatar-${size}.png`

                return R2.send(
                    new PutObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME!,
                        Key: key,
                        Body: pngBuffer,
                        ContentType: 'image/png',
                    })
                )
            })

            await Promise.all(uploads)
        } else {
            const coverPng = await sharp(inputBuffer).rotate().png().toBuffer()

            // Upload to Cloudflare R2
            await R2.send(
                new PutObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME!,
                    Key: storagePath,
                    Body: coverPng,
                    ContentType: 'image/png',
                })
            )
        }

        // Update user table
        const updateData = type === 'avatar' ? { avatar: tablePath } : { cover: tablePath }
        const { error: updateError } = await supabase
            .from('users')
            .update({ ...updateData, updated_at: new Date().toISOString() })
            .eq('id', user.id)

        if (updateError) throw updateError

        revalidatePath(`/@${user.username}`, 'layout')
        revalidateTag(`user:${user.username}`, 'max')

        return { url: tablePath }
    } catch (error) {
        logWarning(`Error uploading ${type}:`, error)
        throw new Error(`Failed to upload ${type}`)
    }
}

// Update self avatar
export async function updateSelfAvatar(file: File) {
    return uploadUserImage(file, 'avatar')
}

// Update self cover
export async function updateSelfCover(file: File) {
    return uploadUserImage(file, 'cover')
}

// Delete a user image (avatar or cover)
export async function deleteUserImage(type: 'avatar' | 'cover') {
    const session = await userSession()
    const user = session.user

    if (!user) throw new Error('Not authenticated')

    const supabase = await createClient()

    try {
        const fileName = `${type}.png`
        const storagePath = `@${user.username}/${fileName}`
        const tablePath = type === 'avatar' ? { avatar: null } : { cover: null }

        // Delete from Cloudflare R2
        if (type === 'avatar') {
            const deletes = AVATAR_SIZES.map((size) => {
                const key = size === 512 ? storagePath : `@${user.username}/avatar-${size}.png`

                return R2.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME!,
                        Key: key,
                    })
                )
            })

            await Promise.all(deletes)
        } else {
            await R2.send(
                new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME!,
                    Key: storagePath,
                })
            )
        }

        // Remove from table
        const { error: updateError } = await supabase
            .from('users')
            .update({ ...tablePath, updated_at: new Date().toISOString() })
            .eq('id', user.id)

        if (updateError) throw updateError

        await revalidatePath(`/@${user.username}`, 'layout')
        await revalidateTag(`user:${user.username}`, 'max')

        return { success: true }
    } catch (error) {
        logWarning(`Error deleting ${type}:`, error)
        throw new Error(`Failed to delete ${type}`)
    }
}

// Remove self avatar
export async function removeSelfAvatar() {
    return deleteUserImage('avatar')
}

// Remove self cover
export async function removeSelfCover() {
    return deleteUserImage('cover')
}
