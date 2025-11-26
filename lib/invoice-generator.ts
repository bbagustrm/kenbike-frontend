// lib/invoice-generator.ts
import { Order, ShippingType } from '@/types/order';
import { formatCurrency } from './format-currency';

/**
 * Generate invoice HTML for PDF conversion
 * This HTML can be used with libraries like jsPDF or html2pdf
 */
export function generateInvoiceHTML(order: Order): string {
    const isDomestic = order.shippingType === ShippingType.DOMESTIC;
    const courierName = isDomestic && order.biteshipCourier && order.biteshipService
        ? `${order.biteshipCourier.toUpperCase()} - ${order.biteshipService.toUpperCase()}`
        : 'Pos Indonesia';

    const invoiceDate = new Date(order.paidAt || order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - ${order.orderNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            padding: 40px;
            background: #fff;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 8px;
        }
        
        .company-details {
            font-size: 12px;
            color: #666;
            line-height: 1.8;
        }
        
        .invoice-info {
            text-align: right;
        }
        
        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 8px;
        }
        
        .invoice-meta {
            font-size: 12px;
            color: #666;
        }
        
        .invoice-meta div {
            margin-bottom: 4px;
        }
        
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .info-box {
            flex: 1;
            margin-right: 20px;
        }
        
        .info-box:last-child {
            margin-right: 0;
        }
        
        .info-box-title {
            font-weight: bold;
            font-size: 14px;
            color: #2563eb;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-box-content {
            font-size: 13px;
            line-height: 1.8;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table thead {
            background: #f3f4f6;
        }
        
        .items-table th {
            padding: 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .items-table td {
            padding: 12px;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
        }
        
        .summary-table {
            width: 350px;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
        }
        
        .summary-row.total {
            border-top: 2px solid #e5e7eb;
            margin-top: 8px;
            padding-top: 12px;
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
        }
        
        .notes-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .notes-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
            color: #374151;
        }
        
        .notes-content {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.8;
        }
        
        .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            font-size: 11px;
            color: #9ca3af;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .badge-success {
            background: #d1fae5;
            color: #065f46;
        }
        
        .badge-domestic {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .badge-international {
            background: #fef3c7;
            color: #92400e;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .invoice-container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-name">KenBike</div>
                <div class="company-details">
                    Jl. Raya Bicycle No. 123<br>
                    Semarang, Central Java 50132<br>
                    Indonesia<br>
                    Phone: +62 812-3456-7890<br>
                    Email: support@kenbike.com
                </div>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-meta">
                    <div><strong>Invoice #:</strong> ${order.orderNumber}</div>
                    <div><strong>Date:</strong> ${invoiceDate}</div>
                    <div><strong>Status:</strong> <span class="badge badge-success">PAID</span></div>
                </div>
            </div>
        </div>
        
        <!-- Customer & Shipping Info -->
        <div class="info-section">
            <div class="info-box">
                <div class="info-box-title">Bill To</div>
                <div class="info-box-content">
                    <strong>${order.user?.firstName} ${order.user?.lastName}</strong><br>
                    ${order.user?.email}<br>
                    ${order.user?.phoneNumber || ''}
                </div>
            </div>
            <div class="info-box">
                <div class="info-box-title">Ship To</div>
                <div class="info-box-content">
                    <strong>${order.recipientName}</strong><br>
                    ${order.recipientPhone}<br>
                    ${order.shippingAddress}<br>
                    ${order.shippingCity}, ${order.shippingProvince || order.shippingCountry}<br>
                    ${order.shippingPostalCode}
                </div>
            </div>
            <div class="info-box">
                <div class="info-box-title">Shipping Method</div>
                <div class="info-box-content">
                    <strong>${courierName}</strong><br>
                    <span class="badge ${isDomestic ? 'badge-domestic' : 'badge-international'}">
                        ${isDomestic ? 'Domestic' : 'International'}
                    </span><br>
                    ${order.trackingNumber ? `Tracking: ${order.trackingNumber}` : ''}
                    ${order.shippingZone ? `<br>Est. Delivery: ${order.shippingZone.minDays}-${order.shippingZone.maxDays} days` : ''}
                </div>
            </div>
        </div>
        
        <!-- Order Items -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>
                            <strong>${item.productName}</strong><br>
                            <span style="color: #6b7280; font-size: 12px;">
                                ${item.variantName} (SKU: ${item.sku})
                            </span>
                        </td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${formatCurrency(item.pricePerItem, order.currency)}</td>
                        <td class="text-right"><strong>${formatCurrency(item.subtotal, order.currency)}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <!-- Summary -->
        <div class="summary-section">
            <div class="summary-table">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping Cost:</span>
                    <span>${formatCurrency(order.shippingCost, order.currency)}</span>
                </div>
                ${order.discount > 0 ? `
                    <div class="summary-row" style="color: #059669;">
                        <span>Discount:</span>
                        <span>-${formatCurrency(order.discount, order.currency)}</span>
                    </div>
                ` : ''}
                <div class="summary-row total">
                    <span>TOTAL PAID:</span>
                    <span>${formatCurrency(order.total, order.currency)}</span>
                </div>
            </div>
        </div>
        
        <!-- Notes -->
        <div class="notes-section">
            <div class="notes-title">Payment Information</div>
            <div class="notes-content">
                Payment Method: <strong>${order.paymentMethod === 'MIDTRANS_SNAP' ? 'Midtrans' : 'PayPal'}</strong><br>
                Payment ID: ${order.paymentId || 'N/A'}<br>
                Payment Date: ${order.paidAt ? new Date(order.paidAt).toLocaleString('en-US') : 'N/A'}<br>
                <br>
                Tax is included in product prices. All prices are in ${order.currency}.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Thank you for your purchase!</p>
            <p style="margin-top: 8px;">
                This is a computer-generated invoice and does not require a signature.
            </p>
            <p style="margin-top: 8px;">
                © ${new Date().getFullYear()} KenBike. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Generate and download invoice as PDF
 * Requires: html2pdf.js library
 *
 * Usage in component:
 * ```
 * import html2pdf from 'html2pdf.js';
 * import { generateInvoiceHTML, downloadInvoicePDF } from '@/lib/invoice-generator';
 *
 * const handleDownload = () => {
 *     downloadInvoicePDF(order);
 * };
 * ```
 */
export async function downloadInvoicePDF(order: Order): Promise<void> {
    // Check if html2pdf is available
    if (typeof window === 'undefined') {
        throw new Error('PDF generation is only available in browser');
    }

    try {
        // Dynamic import html2pdf
        const html2pdf = (await import('html2pdf.js')).default;

        const html = generateInvoiceHTML(order);

        const opt = {
            margin: 10,
            filename: `invoice-${order.orderNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        await html2pdf().set(opt).from(html).save();
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        throw new Error('Failed to generate invoice PDF');
    }
}

/**
 * Print invoice
 */
export function printInvoice(order: Order): void {
    const html = generateInvoiceHTML(order);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.print();
        };
    }
}