import { createClient } from '@supabase/supabase-js'
import { generateInvoicePDF } from '@/lib/invoice-generator'
import { sendEmail } from '@/lib/email'
import { getOrderConfirmationTemplate } from '@/lib/email-templates/confirmation'

const getSupabase = () => {
    // Prefer Service Role Key for Admin Operations (Invoice Gen, Stock Deduct)
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        key
    )
}

export async function processInvoice(orderId) {
    const supabase = getSupabase()

    // 1. Fetch Order - Fetch items AND products
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`*, items:order_items(*, products(*))`)
        .eq('id', orderId)
        .single()

    if (orderError || !order) throw new Error('Order not found for invoicing')

    // 2. Check if Invoice Exists
    const { data: existing } = await supabase.from('invoices').select('*').eq('order_id', orderId).single()
    if (existing) return existing

    // 3. Stock Management: Deduct Inventory
    // We do this here as 'processInvoice' implies a confirmed paid order.
    await deductStock(supabase, order)

    // 4. Generate Invoice Number (Ref: Order ID as requested)
    const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`

    // 5. Generate PDF
    const pdfBuffer = generateInvoicePDF({ ...order, invoice_number: invoiceNumber })

    // 6. Upload PDF
    const fileName = `${invoiceNumber}.pdf`
    const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true
        })

    if (uploadError) console.error("PDF Upload Failed", uploadError)

    const { data: publicData } = supabase.storage.from('invoices').getPublicUrl(fileName)
    const pdfUrl = publicData.publicUrl

    // 7. Save Invoice Record
    const { data: invoice, error: dbError } = await supabase.from('invoices').insert({
        invoice_number: invoiceNumber,
        order_id: order.id,
        user_id: order.user_id,
        subtotal: order.total_amount,
        tax_amount: 0,
        total_amount: order.total_amount,
        pdf_url: pdfUrl,
        status: 'issued'
    }).select().single()

    if (dbError) throw dbError

    // 8. Email Invoice
    await sendEmail({
        to: order.user_email,
        subject: `ZOOMERS // ORDER CONFIRMED: #${order.id.slice(0, 8).toUpperCase()} // INVOICE ATTACHED`,
        html: getOrderConfirmationTemplate(order),
        attachments: [
            {
                filename: fileName,
                content: Buffer.from(pdfBuffer),
                contentType: 'application/pdf'
            }
        ]
    }).catch(err => console.error("Invoice Email Failed", err))

    return invoice
}

// Helper to deduct stock
async function deductStock(supabase, order) {
    if (!order.items || order.items.length === 0) return

    console.log(`Processing Stock Deduction for Order #${order.id}`)

    for (const item of order.items) {
        if (!item.product_id) continue

        // We use a direct RPC call if available, or a raw SQL query. 
        // Since we don't have a guaranteed RPC 'decrement_stock', we'll try a direct update.
        // However, standard Supabase JS client doesn't support "decrement" natively without fetching first.
        // Best practice is an RPC. Let's assume we can't create RPCs easily right now (user permissions?).
        // We will fetch current, subtract, and update. It has race conditions but suits this "internal stock system" MVP.

        const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single()

        if (product && typeof product.stock_quantity === 'number') {
            const newStock = product.stock_quantity - item.quantity

            const { error: updateError } = await supabase
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', item.product_id)

            if (updateError) {
                console.error(`FAILED to decrement Product ${item.product_id}:`, updateError)
            } else {
                console.log(`Decremented Product ${item.product_id} to ${newStock}`)
            }
        }
    }
}
