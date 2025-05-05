import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import sgMail from '@sendgrid/mail';

const prisma = new PrismaClient();

const SECRET_TOKEN = process.env.CRON_SECRET_TOKEN;

interface OverduePayment {
  id: number;
  amount: number;
  dueDate: Date;
  lease: {
    id: number;
    unit: {
      unitNumber: string;
      property: {
        name: string;
        address: string;
      };
    };
  };
  tenant: {
    user: {
      name: string;
      email: string;
    };
  };
}

const getOverduePayments = async (): Promise<OverduePayment[]> => {
  const payments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.OVERDUE,
      paidDate: null,
    },
    include: {
      lease: {
        select: {
          id: true,
          unit: {
            select: {
              unitNumber: true,
              property: {
                select: {
                  name: true,
                  address: true,
                },
              },
            },
          },
        },
      },
      tenant: {
        select: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Map Decimal to number for amount
  return payments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    dueDate: p.dueDate,
    lease: p.lease,
    tenant: p.tenant,
  }));
};

const sendOverdueEmail = async (
  to: string,
  name: string,
  property: string,
  unit: string,
  dueDate: Date,
  amount: number
) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error('SendGrid API key is not configured');
  sgMail.setApiKey(apiKey);

  const formattedDate = dueDate.toLocaleDateString('en-US');
  const formattedAmount = `$${amount.toFixed(2)}`;

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Overdue Rent Payment Reminder',
    html: `
      <div class="font-sans text-gray-800">
        <h2 class="text-lg font-bold mb-2">Hello ${name},</h2>
        <p class="mb-2">This is a reminder that your rent payment for <strong>${property}, Unit ${unit}</strong> was due on <strong>${formattedDate}</strong> and is now overdue.</p>
        <p class="mb-2">Amount Due: <span class="font-semibold">${formattedAmount}</span></p>
        <p class="mb-2">Please make your payment as soon as possible to avoid late fees or further action.</p>
        <p>If you have already made this payment, please disregard this message.</p>
        <p class="mt-4">Thank you,<br/>Property Management Team</p>
      </div>
    `,
  };
  await sgMail.send(msg);
};

export const GET = async (req: NextRequest) => {
  const token = req.nextUrl.searchParams.get('token');
  if (!SECRET_TOKEN || token !== SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const overduePayments = await getOverduePayments();
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const payment of overduePayments) {
      const email = payment.tenant.user.email;
      const name = payment.tenant.user.name;
      const property = payment.lease.unit.property.name;
      const unit = payment.lease.unit.unitNumber;
      const dueDate = payment.dueDate;
      const amount = Number(payment.amount);
      try {
        await sendOverdueEmail(email, name, property, unit, dueDate, amount);
        sent++;
      } catch (err: unknown) {
        failed++;
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Payment ID ${payment.id}: ${message}`);
      }
    }

    return NextResponse.json({
      total: overduePayments.length,
      sent,
      failed,
      errors,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}; 