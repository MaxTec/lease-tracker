import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { Prisma } from '@prisma/client';

// GET /api/payments - Get all payments
export async function GET() {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                lease: {
                    include: {
                        unit: {
                            include: {
                                property: true
                            }
                        },
                        tenant: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                },
                voucher: true
            }
        });

        // Transform Decimal to number for JSON serialization
        const serializedPayments = payments.map(payment => ({
            ...payment,
            amount: payment.amount instanceof Prisma.Decimal
                ? parseFloat(payment.amount.toString())
                : payment.amount,
            lease: {
                ...payment.lease,
                rentAmount: payment.lease.rentAmount instanceof Prisma.Decimal
                    ? parseFloat(payment.lease.rentAmount.toString())
                    : payment.lease.rentAmount,
                depositAmount: payment.lease.depositAmount instanceof Prisma.Decimal
                    ? parseFloat(payment.lease.depositAmount.toString())
                    : payment.lease.depositAmount,
            }
        }));

        return NextResponse.json(serializedPayments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}

// POST /api/payments - Create a new payment
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.leaseId || !data.tenantId || !data.amount || !data.dueDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create the payment
        const payment = await prisma.payment.create({
            data: {
                leaseId: data.leaseId,
                tenantId: data.tenantId,
                amount: new Prisma.Decimal(data.amount),
                dueDate: new Date(data.dueDate),
                paidDate: data.paidDate ? new Date(data.paidDate) : null,
                status: data.status || 'PENDING',
                paymentMethod: data.paymentMethod || null,
                transactionId: data.transactionId || null,
            },
            include: {
                lease: {
                    include: {
                        unit: {
                            include: {
                                property: true
                            }
                        },
                        tenant: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Transform Decimal to number for JSON serialization
        const serializedPayment = {
            ...payment,
            amount: payment.amount instanceof Prisma.Decimal
                ? parseFloat(payment.amount.toString())
                : payment.amount,
            lease: {
                ...payment.lease,
                rentAmount: payment.lease.rentAmount instanceof Prisma.Decimal
                    ? parseFloat(payment.lease.rentAmount.toString())
                    : payment.lease.rentAmount,
                depositAmount: payment.lease.depositAmount instanceof Prisma.Decimal
                    ? parseFloat(payment.lease.depositAmount.toString())
                    : payment.lease.depositAmount,
            }
        };

        // Generate a voucher if payment is PAID
        if (payment.status === 'PAID' && payment.paidDate) {
            const voucherNumber = `VCH-${Date.now()}-${payment.id}`;

            await prisma.voucher.create({
                data: {
                    paymentId: payment.id,
                    voucherNumber,
                    status: 'GENERATED'
                }
            });
        }

        return NextResponse.json(serializedPayment, { status: 201 });
    } catch (error) {
        console.error('Error creating payment:', error);
        return NextResponse.json(
            { error: 'Failed to create payment' },
            { status: 500 }
        );
    }
} 