import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateInvoicePDF = (order) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    })

    const { id, items, total_amount, currency, shipping_address, created_at, user_email } = order

    // Formatting Constants
    const date = new Date(created_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).toUpperCase()

    // --- 1. HEADER ---
    doc.setFont("helvetica", "bold")
    doc.setFontSize(32)
    doc.text("ZOOMERS", 15, 25)

    doc.setFontSize(8)
    doc.setFont("courier", "normal")
    doc.text("ARCHIVE MANIFEST", 195, 20, { align: 'right' })
    doc.text("OFFICIAL DOCUMENTATION", 195, 24, { align: 'right' })
    doc.text("LONDON // GLOBAL", 195, 28, { align: 'right' })

    doc.setLineWidth(0.2)
    doc.line(15, 35, 195, 35)

    // --- 2. META GRID ---
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.text("BILLED TO", 15, 45)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    let yPos = 52
    if (shipping_address) {
        doc.text(`${shipping_address.first_name} ${shipping_address.last_name}`.toUpperCase(), 15, yPos); yPos += 5
        doc.text((shipping_address.line1 || '').toUpperCase(), 15, yPos); yPos += 5
        doc.text(`${shipping_address.city}, ${shipping_address.postal_code}`.toUpperCase(), 15, yPos); yPos += 5
        doc.text((shipping_address.country || '').toUpperCase(), 15, yPos); yPos += 8
    } else {
        doc.text("GUEST ARCHIVIST", 15, yPos); yPos += 8
    }
    // Email below address
    doc.setFontSize(8)
    doc.text(user_email.toUpperCase(), 15, yPos)

    // Right Side: Ref
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.text("REFERENCE ID", 150, 45)
    doc.text("DATE ISSUED", 195, 45, { align: 'right' })

    doc.setFont("courier", "normal")
    doc.setFontSize(10)
    doc.text(`#${id.slice(0, 8).toUpperCase()}`, 150, 52)
    doc.text(date, 195, 52, { align: 'right' })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.text("PAYMENT STATUS", 195, 65, { align: 'right' })

    doc.setFont("courier", "normal")
    doc.setFontSize(10)
    doc.text("SETTLED", 195, 70, { align: 'right' })

    // --- 3. ITEMS TABLE ---
    // Ensure table uses 'helvetica' for body to support currency symbols better than standard courier
    const tableColumn = ["REF", "DESCRIPTION", "QTY", "UNIT VAL", "TOTAL"]
    const tableRows = items.map(item => [
        (item.id || item.products?.id || 'N/A').slice(0, 6).toUpperCase(),
        item.products?.name?.toUpperCase() || "UNKNOWN ARTEFACT",
        item.quantity,
        formatCurrency(item.price, currency),
        formatCurrency(item.price * item.quantity, currency)
    ])

    autoTable(doc, {
        startY: 90,
        head: [tableColumn],
        body: tableRows,
        theme: 'plain',
        styles: {
            fontSize: 9,
            font: 'helvetica', // Switch to Helvetica for better char support
            cellPadding: 3,
            fillColor: null,
            textColor: 0,
            overflow: 'linebreak',
            valign: 'middle'
        },
        headStyles: {
            font: 'helvetica',
            fontStyle: 'bold',
            fontSize: 7,
            textColor: 0,
            fillColor: null,
            lineWidth: { bottom: 0.2 },
            lineColor: 0
        },
        // COLUMN ALIGNMENT CONFIG
        columnStyles: {
            0: { cellWidth: 30, halign: 'left' },   // REF
            1: { cellWidth: 'auto', halign: 'left' }, // DESC
            2: { cellWidth: 20, halign: 'center' }, // QTY
            3: { cellWidth: 30, halign: 'right' },  // UNIT
            4: { cellWidth: 30, halign: 'right' }   // TOTAL
        },
        didDrawPage: (data) => {
            // Footer
            doc.setFontSize(7)
            doc.setFont("courier", "normal")
            doc.setTextColor(150)
            doc.text("ZOOMERS ARCHIVE SYSTEM // 2024", 105, 285, { align: 'center' })
        }
    })

    // --- 4. TOTALS SECTION ---
    let finalY = doc.lastAutoTable.finalY + 5

    // Divider
    doc.setDrawColor(0) // Black line
    doc.setLineWidth(0.2)
    doc.line(135, finalY, 195, finalY)
    finalY += 6

    // We strictly use right alignment x=195 for values
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(0)

    doc.text("SUBTOTAL", 135, finalY + 4)
    doc.text(formatCurrency(total_amount, currency), 195, finalY + 4, { align: 'right' })

    doc.text("SHIPPING", 135, finalY + 9)
    doc.text("FREE", 195, finalY + 9, { align: 'right' })

    finalY += 16

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("TOTAL DECLARATION", 135, finalY)
    doc.text(formatCurrency(total_amount, currency), 195, finalY, { align: 'right' })

    // --- 5. FOOTER NOTES ---
    // --- 5. FOOTER NOTES ---
    doc.setFontSize(7)
    doc.setFont("courier", "normal")
    doc.setTextColor(100)
    doc.text("YOUR CONTRIBUTION TO THE ARCHIVE IS NOTED.", 15, 260)
    doc.text("THE COLLECTION EVOLVES. RETURN TO SECURE FUTURE ARTEFACTS.", 15, 264)

    return doc.output('arraybuffer')
}

const formatCurrency = (amount, currency = 'USD') => {
    // Usage of Symbols (₹, €, etc.) fails in standard PDF fonts (WinAnsi).
    // We use ISO Codes (INR, USD) for technical aesthetic and 100% safety.
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'code' // 'USD 100.00' instead of '$100.00'
    }).format(amount).replace(/\u00A0/g, ' ')
}
