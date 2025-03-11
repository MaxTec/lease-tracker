import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/utils/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST() {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get all pending payments with tenant information
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        lease: {
          include: {
            tenant: {
              include: {
                user: {
                  select: {
                    email: true,
                    name: true,
                  },
                },
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
    });

    // Group payments by tenant email to avoid sending multiple emails to the same tenant
    const paymentsByTenant = pendingPayments.reduce((acc, payment) => {
      const email = payment.lease.tenant.user.email;
      if (!acc[email]) {
        acc[email] = [];
      }
      acc[email].push(payment);
      return acc;
    }, {} as Record<string, typeof pendingPayments>);

    // In a real application, you would send emails here
    // For demonstration purposes, we'll just log the emails that would be sent
    const emailsSent = Object.entries(paymentsByTenant).map(([email, payments]) => {
      console.log(`Sending email to ${email} for ${payments.length} pending payments`);
      
      // Here you would integrate with your email service
      // Example: await sendEmail(email, 'Payment Reminder', emailTemplate(payments));
      
      return email;
    });

    return NextResponse.json({
      success: true,
      emailsSent: emailsSent.length,
      message: 'Bulk emails sent successfully',
    });
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk emails' },
      { status: 500 }
    );
  }
} 