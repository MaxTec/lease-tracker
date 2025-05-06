import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable is not set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// POST /api/vouchers/send - Send voucher via email
export async function POST(request: NextRequest) {
  console.log("Received request:", request);
  try {
    const data = await request.json();
    console.log("Received data:", data);
    if (!data.voucherId || !data.pdfBase64) {
      console.log("Missing required data");
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const voucher = await prisma.voucher.findUnique({
      where: { id: data.voucherId },
      include: {
        payment: {
          include: {
            lease: {
              include: {
                tenant: {
                  include: {
                    user: true,
                  },
                },
                unit: {
                  include: {
                    property: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    const tenantEmail = voucher.payment.lease.tenant.user.email;
    const tenantName = voucher.payment.lease.tenant.user.name;
    const propertyName = voucher.payment.lease.unit.property.name;
    const unitNumber = voucher.payment.lease.unit.unitNumber;
    const amount = Number(voucher.payment.amount);
    const voucherUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vouchers/${voucher.voucherNumber}`;

    // Use provided emails if valid, otherwise tenant's email
    let recipientEmails: string[] = [tenantEmail];
    if (Array.isArray(data.emails) && data.emails.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of data.emails) {
        if (!emailRegex.test(email)) {
          return NextResponse.json({ error: `Invalid email address: ${email}` }, { status: 400 });
        }
      }
      recipientEmails = data.emails;
    }

    await sgMail.send({
      to: recipientEmails,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@example.com",
      cc: "max.tec92@hotmail.com",
      subject: `Comprobante de Pago para ${propertyName} - Unidad ${unitNumber}`,
      html: `
                <h1>Comprobante de Pago</h1>
                <p>Estimado/a ${tenantName},</p>
                <p>Su comprobante de pago para ${propertyName} - Unidad ${unitNumber} está listo.</p>
                <p>Monto: $${amount}</p>
                <p>Por favor, encuentre su comprobante de pago adjunto a este correo electrónico.</p>
                <p>También puede ver su comprobante en línea en: <a href="${voucherUrl}">${voucherUrl}</a></p>
                <p>¡Gracias por su pago!</p>
            `,
      attachments: [
        {
          content: data.pdfBase64,
          filename: `comprobante-${voucher.voucherNumber}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });

    // Update voucher status
    const updatedVoucher = await prisma.voucher.update({
      where: { id: data.voucherId },
      data: {
        status: "SENT",
        sentDate: new Date(),
      },
    });

    return NextResponse.json({
      message: `Voucher ${voucher.voucherNumber} sent to ${recipientEmails.join(", ")}`,
      voucher: updatedVoucher,
    });
  } catch (error) {
    console.error("Error sending voucher:", error);
    return NextResponse.json(
      { error: "Failed to send voucher" },
      { status: 500 }
    );
  }
}
