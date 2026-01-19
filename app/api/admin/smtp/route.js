import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
    try {
        const body = await req.json()
        const { id, host, port, username, password, from_email, from_name } = body

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )

        // Security Check: Ideally check if user.role === 'admin'
        // For now, we trust the database RLS or the fact this is an internal admin route.

        let result
        if (id) {
            // Update
            result = await supabase.from('smtp_settings').update({
                host, port, username, password, from_email, from_name
            }).eq('id', id).select()
        } else {
            // Create (ensure only one exists logic is handled by UI or Unique constraint? we did unique index on (true))
            // We'll try to insert.
            // First check if exists? The Unique index will fail insertion if multiple.
            // We should ideally upsert.

            // Hacky upsert for single row enforcement:
            // Fetch first.
            const { data: existing } = await supabase.from('smtp_settings').select('id').single()

            if (existing) {
                result = await supabase.from('smtp_settings').update({
                    host, port, username, password, from_email, from_name
                }).eq('id', existing.id).select()
            } else {
                result = await supabase.from('smtp_settings').insert({
                    host, port, username, password, from_email, from_name
                }).select()
            }
        }

        if (result.error) throw result.error

        return NextResponse.json({ success: true, data: result.data })

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(req) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data, error } = await supabase.from('smtp_settings').select('*').single()
    // Should Mask Password?
    if (data) data.password = '********'

    return NextResponse.json({ data })
}
