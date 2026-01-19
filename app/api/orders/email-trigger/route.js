import { NextResponse } from 'next/server'
import { processInvoice } from '@/lib/billing'

export async function POST(req) {
    try {
        const { orderId } = await req.json()

        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
        }

        // The processInvoice function handles:
        // 1. Fetching Order
        // 2. Generating Invoice PDF
        // 3. Uploading to Storage
        // 4. Sending Email with Attachment
        const invoice = await processInvoice(orderId)

        return NextResponse.json({ success: true, invoiceId: invoice?.id })

    } catch (error) {
        console.error("Billing/Email API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
