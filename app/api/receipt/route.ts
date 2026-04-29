import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import jsPDF from 'jspdf';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transaction_id');
    const format = searchParams.get('format') || 'html'; // html or pdf

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT t.*, m.first_name, m.last_name, m.email, m.phone
      FROM transactions t
      LEFT JOIN members m ON t.member_id = m.id
      WHERE t.id = ${transactionId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const transaction = result.rows[0];
    const receiptNumber = transaction.id.substring(0, 8).toUpperCase();
    const createdAt = new Date(transaction.created_at).toLocaleString();
    const memberName = transaction.first_name
      ? `${transaction.first_name} ${transaction.last_name}`
      : 'Walk-in Guest';

    if (format === 'pdf') {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.setFontSize(14);
      pdf.text('GYM RECEIPT', 105, 20, { align: 'center' });

      pdf.setFontSize(10);
      pdf.text(`Receipt #: ${receiptNumber}`, 20, 35);
      pdf.text(`Date: ${createdAt}`, 20, 42);

      pdf.text('---- Member Details ----', 20, 52);
      pdf.text(`Name: ${memberName}`, 20, 59);
      if (transaction.email) {
        pdf.text(`Email: ${transaction.email}`, 20, 66);
      }
      if (transaction.phone) {
        pdf.text(`Phone: ${transaction.phone}`, 20, 73);
      }

      pdf.text('---- Transaction Details ----', 20, 85);
      pdf.text(`Type: ${transaction.type}`, 20, 92);
      pdf.text(`Description: ${transaction.description || 'N/A'}`, 20, 99);
      pdf.text(`Amount: ₱${parseFloat(transaction.amount).toFixed(2)}`, 20, 106);
      pdf.text(`Payment Method: ${transaction.payment_method}`, 20, 113);

      pdf.text('Thank you for your business!', 105, 130, { align: 'center' });

      const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="receipt-${receiptNumber}.pdf"`,
        },
      });
    } else {
      // Return HTML receipt
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Receipt - ${receiptNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .receipt {
              border: 1px solid #ccc;
              padding: 20px;
            }
            .header {
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .section {
              margin: 15px 0;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .section-title {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .line {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .amount {
              text-align: right;
              font-weight: bold;
              font-size: 16px;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .receipt { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">GYM RECEIPT</div>
            
            <div class="section">
              <div class="line">
                <span>Receipt #:</span>
                <span>${receiptNumber}</span>
              </div>
              <div class="line">
                <span>Date:</span>
                <span>${createdAt}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Member Details</div>
              <div class="line">
                <span>Name:</span>
                <span>${memberName}</span>
              </div>
              ${transaction.email ? `<div class="line"><span>Email:</span><span>${transaction.email}</span></div>` : ''}
              ${transaction.phone ? `<div class="line"><span>Phone:</span><span>${transaction.phone}</span></div>` : ''}
            </div>

            <div class="section">
              <div class="section-title">Transaction Details</div>
              <div class="line">
                <span>Type:</span>
                <span>${transaction.type}</span>
              </div>
              ${transaction.description ? `<div class="line"><span>Description:</span><span>${transaction.description}</span></div>` : ''}
            </div>

            <div class="section">
              <div class="line">
                <span>Total Amount:</span>
                <span class="amount">₱${parseFloat(transaction.amount).toFixed(2)}</span>
              </div>
              <div class="line">
                <span>Payment Method:</span>
                <span>${transaction.payment_method}</span>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #666;">
              Thank you for your business!
            </div>
          </div>
        </body>
        </html>
      `;

      return NextResponse.json({
        html,
        receipt: {
          number: receiptNumber,
          member: memberName,
          amount: parseFloat(transaction.amount).toFixed(2),
          date: createdAt,
        },
      });
    }
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    );
  }
}
