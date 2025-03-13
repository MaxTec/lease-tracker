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

    await sgMail.send({
      to: tenantEmail,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@example.com",
      cc: "max.tec92@hotmail.com",
      subject: `Payment Voucher for ${propertyName} - Unit ${unitNumber}`,
      html: `
                <h1>Payment Voucher</h1>
                <p>Dear ${tenantName},</p>
                <p>Your payment voucher for ${propertyName} - Unit ${unitNumber} is ready.</p>
                <p>Amount: $${amount}</p>
                <p>Please find your payment voucher attached to this email.</p>
                <p>You can also view your voucher online at: <a href="${voucherUrl}">${voucherUrl}</a></p>
                <p>Thank you for your payment!</p>
            `,
      attachments: [
        {
          content: data.pdfBase64,
          filename: `voucher-${voucher.voucherNumber}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
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
      message: `Voucher ${voucher.voucherNumber} sent to ${tenantEmail}`,
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
