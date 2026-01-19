export const getOrderConfirmationTemplate = (order) => {
    const { id, items, total_amount, currency, shipping_address, created_at } = order
    const total = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(total_amount)
    const date = new Date(created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).toUpperCase()

    // Formatting Items
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px dotted #000; font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase;">
                ${item.products?.name || 'Unknown Artifact'}
                <div style="color: #666; font-size: 10px; margin-top: 4px;">SZ: ${item.size} / REF: ${item.product_id.toString().slice(0, 6)}</div>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px dotted #000; font-family: 'Courier New', Courier, monospace; font-size: 11px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px 0; border-bottom: 1px dotted #000; font-family: 'Courier New', Courier, monospace; font-size: 11px; text-align: right;">
                ${new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(item.price)}
            </td>
        </tr>
    `).join('')

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="format-detection" content="telephone=no"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Acquisition Confirmed</title>
    <style type="text/css">
        body { margin: 0; padding: 0; background-color: #f4f4f5; -webkit-font-smoothing: antialiased; }
        table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        a { color: #000000; text-decoration: underline; }
        .wrapper { width: 100%; table-layout: fixed; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        .webkit { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e5e5; }
        @media only screen and (max-width: 600px) {
            .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
    <div class="wrapper" style="padding: 40px 0;">
        
        <!-- MAIN CONTAINER -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" class="webkit" width="600" style="font-family: Helvetica, Arial, sans-serif; background-color: #ffffff; border: 1px solid #000000;">
            
            <!-- HEADER LOGO -->
            <tr>
                <td align="center" style="padding: 40px 0 20px 0; border-bottom: 4px solid #000000;">
                    <h1 style="margin: 0; font-size: 28px; letter-spacing: 4px; font-weight: 900; text-transform: uppercase;">Zoomers</h1>
                    <p style="margin: 5px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Archive System™ // London</p>
                </td>
            </tr>

            <!-- META DATA GRID -->
            <tr>
                <td>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td width="50%" style="padding: 15px; border-bottom: 1px solid #000000; border-right: 1px solid #000000; vertical-align: top;">
                                <p style="margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Reference ID</p>
                                <p style="margin: 5px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold;">#${id.slice(0, 8).toUpperCase()}</p>
                            </td>
                            <td width="50%" style="padding: 15px; border-bottom: 1px solid #000000; vertical-align: top;">
                                <p style="margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Date Issued</p>
                                <p style="margin: 5px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold;">${date}</p>
                            </td>
                        </tr>
                        <tr>
                            <td width="50%" style="padding: 15px; border-bottom: 4px solid #000000; border-right: 1px solid #000000; vertical-align: top;">
                                <p style="margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Client</p>
                                <p style="margin: 5px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold;">${shipping_address?.first_name} ${shipping_address?.last_name}</p>
                            </td>
                            <td width="50%" style="padding: 15px; border-bottom: 4px solid #000000; vertical-align: top;">
                                <p style="margin: 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Status</p>
                                <p style="margin: 5px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold; color: #000;">● CONFIRMED</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- MESSAGE -->
            <tr>
                <td style="padding: 40px 40px 20px 40px;" class="mobile-padding">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #000000;">
                        The acquisition has been successfully recorded in our central ledger. The artifacts listed below have been allocated to your reserve and are being prepared for dispatch to <strong>${shipping_address?.city}, ${shipping_address?.country}</strong>.
                    </p>
                </td>
            </tr>

            <!-- MANIFEST TABLE -->
            <tr>
                <td style="padding: 0 40px 40px 40px;" class="mobile-padding">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <thead>
                            <tr>
                                <th align="left" style="padding-bottom: 15px; border-bottom: 2px solid #000000; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Artifact</th>
                                <th align="center" style="padding-bottom: 15px; border-bottom: 2px solid #000000; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;" width="40">Qty</th>
                                <th align="right" style="padding-bottom: 15px; border-bottom: 2px solid #000000; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;" width="80">Val</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" align="right" style="padding-top: 20px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Total Authorized</td>
                                <td align="right" style="padding-top: 20px; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: bold;">${total}</td>
                            </tr>
                        </tfoot>
                    </table>
                </td>
            </tr>

            <!-- SHIPPING FOOTER -->
            <tr>
                <td style="background-color: #000000; color: #ffffff; padding: 30px 40px;" class="mobile-padding">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td width="60%" style="vertical-align: top;">
                                <p style="margin: 0 0 10px 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.6;">Dispatch Destination</p>
                                <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 1.5;">
                                    ${shipping_address?.line1}<br>
                                    ${shipping_address?.city}, ${shipping_address?.postal_code}<br>
                                    ${shipping_address?.country}
                                </p>
                            </td>
                            <td width="40%" style="vertical-align: top; text-align: right;">
                                <p style="margin: 0 0 10px 0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.6;">Contact</p>
                                <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 11px;">
                                    <a href="mailto:support.zoomers@darade.in" style="color: #ffffff; text-decoration: none;">support.zoomers@darade.in</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- FINAL BRANDING -->
            <tr>
                <td align="center" style="padding: 20px; background-color: #f4f4f5;">
                    <p style="margin: 0; font-family: 'Courier New', Courier, monospace; font-size: 9px; text-transform: uppercase; color: #888;">
                        Generated by Zoomers Archive System™ v2.0
                    </p>
                </td>
            </tr>

        </table>
    </div>
</body>
</html>
    `
}
