'use server'

import { z } from 'zod'

import { createClient } from '@/supabase/server'

export async function getData<T>(
    tableName: string,
    filters?: [string, string, string | number | boolean]
): Promise<T[]> {
    const tableSchema = z.string().min(1, 'Table name cannot be empty')
    const parsedTableName = tableSchema.parse(tableName)

    const supabase = await createClient()

    const query = supabase.from(parsedTableName).select('*').order('id', { ascending: true })

    if (filters) {
        query.filter(filters[0], filters[1], filters[2])
    }

    const { data, error } = await query

    if (error) {
        throw new Error(error.message)
    }

    return data as T[]
}
