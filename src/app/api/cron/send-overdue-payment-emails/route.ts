import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';
import { generatePaymentSchedule } from '@/utils/paymentsUtils';
import { Payment } from '@/types/payment';

const prisma = new PrismaClient();

const SECRET_TOKEN = process.env.CRON_SECRET_TOKEN;
const NOTIFICATION_COOLDOWN_DAYS = 7; // No enviar notificaciones más frecuentemente que cada 3 días

interface OverduePayment {
  id?: number;
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
    id: number;
    user: {
      name: string;
      email: string;
    };
  };
}

interface LeaseScheduleInfo {
  startDate: Date;
  endDate: Date;
  paymentDay: number;
  rentAmount: number;
}

interface TenantOverduePayments {
  name: string;
  email: string;
  payments: {
    property: string;
    unit: string;
    dueDate: Date;
    amount: number;
  }[];
}

const getOverduePayments = async (): Promise<OverduePayment[]> => {
  // Get all active leases with their payments and related information
  const leases = await prisma.lease.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      payments: {
        include: {
          lease: true,
          voucher: true,
        },
      },
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
      tenant: {
        select: {
          id: true,
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

  const today = new Date();
  const overduePayments: OverduePayment[] = [];

  // For each lease, generate the payment schedule and find overdue payments
  for (const lease of leases) {
    const leaseInfo: LeaseScheduleInfo = {
      startDate: lease.startDate,
      endDate: lease.endDate,
      paymentDay: lease.paymentDay,
      rentAmount: Number(lease.rentAmount),
    };

    const paymentSchedule = generatePaymentSchedule(
      lease.payments as unknown as Payment[],
      leaseInfo,
      today
    );

    // Filter for overdue payments
    const overdue = paymentSchedule.filter(
      (payment) => payment.status === 'OVERDUE'
    );

    // Add each overdue payment to our result
    for (const payment of overdue) {
      overduePayments.push({
        id: payment.id ? Number(payment.id) : undefined,
        amount: payment.amount,
        dueDate: payment.dueDate,
        lease: {
          id: lease.id,
          unit: lease.unit,
        },
        tenant: lease.tenant,
      });
    }
  }

  return overduePayments;
};

const sendOverdueEmail = async (
  to: string,
  name: string,
  overduePayments: TenantOverduePayments['payments']
) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error('SendGrid API key is not configured');
  sgMail.setApiKey(apiKey);

  const totalAmount = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const formattedTotal = `$${totalAmount.toFixed(2)}`;

  const paymentsList = overduePayments
    .map(
      (payment) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${payment.property}, Unidad ${payment.unit}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${payment.dueDate.toLocaleDateString('es-MX')}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">$${payment.amount.toFixed(2)}</td>
        </tr>
      `
    )
    .join('');

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Recordatorio de Pagos de Renta Vencidos',
    html: `
      <div class="font-sans text-gray-800">
        <h2 class="text-lg font-bold mb-2">Hola ${name},</h2>
        <p class="mb-2">Este es un recordatorio de que tienes los siguientes pagos de renta vencidos:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Propiedad</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Fecha de Vencimiento</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Monto</th>
            </tr>
          </thead>
          <tbody>
            ${paymentsList}
          </tbody>
          <tfoot>
            <tr style="background-color: #f3f4f6;">
              <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total a Pagar:</td>
              <td style="padding: 8px; font-weight: bold;">${formattedTotal}</td>
            </tr>
          </tfoot>
        </table>

        <p class="mb-2">Por favor, realiza tu pago lo antes posible para evitar cargos por retraso o acciones adicionales.</p>
        <p>Si ya has realizado estos pagos, por favor ignora este mensaje.</p>
        <p class="mt-4">Gracias,<br/>Equipo de Administración de Propiedades</p>
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
    let skipped = 0;
    const errors: string[] = [];

    // Group overdue payments by tenant
    const tenantPayments = new Map<string, TenantOverduePayments>();

    for (const payment of overduePayments) {
      const email = payment.tenant.user.email;
      const name = payment.tenant.user.name;
      const property = payment.lease.unit.property.name;
      const unit = payment.lease.unit.unitNumber;
      const dueDate = payment.dueDate;
      const amount = payment.amount;

      if (!tenantPayments.has(email)) {
        tenantPayments.set(email, {
          name,
          email,
          payments: [],
        });
      }

      tenantPayments.get(email)!.payments.push({
        property,
        unit,
        dueDate,
        amount,
      });
    }

    // Send one email per tenant with all their overdue payments
    for (const [email, tenantData] of tenantPayments) {
      try {
        // Get the tenant's ID from the first payment
        const tenantId = overduePayments.find(p => p.tenant.user.email === email)?.tenant.id;
        console.log('tenantId', tenantId);
        if (!tenantId) {
          throw new Error('Tenant ID not found');
        }

        // Check if we can send a notification to this tenant
        const lastNotification = await prisma.overduePaymentNotification.findFirst({
          where: {
            tenantId,
            nextNotificationAt: {
              gt: new Date(), // Only consider notifications that haven't expired yet
            },
          },
          orderBy: {
            sentAt: 'desc',
          },
        });

        console.log('lastNotification', lastNotification);

        if (lastNotification) {
          console.log(`Skipping notification for tenant ${email} - next notification allowed at ${lastNotification.nextNotificationAt}`);
          skipped++;
          continue;
        }

        // Send the email
        await sendOverdueEmail(email, tenantData.name, tenantData.payments);

        // Record the notification
        const totalAmount = tenantData.payments.reduce((sum, p) => sum + p.amount, 0);
        const nextNotificationAt = new Date();
        nextNotificationAt.setDate(nextNotificationAt.getDate() + NOTIFICATION_COOLDOWN_DAYS);

        await prisma.overduePaymentNotification.create({
          data: {
            tenantId,
            totalAmount,
            paymentCount: tenantData.payments.length,
            nextNotificationAt,
          },
        });

        sent++;
      } catch (err: unknown) {
        failed++;
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Tenant ${email}: ${message}`);
      }
    }

    return NextResponse.json({
      total: overduePayments.length,
      tenants: tenantPayments.size,
      sent,
      skipped,
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