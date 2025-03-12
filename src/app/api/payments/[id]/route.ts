import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/utils/db';
import { Prisma, PaymentStatus, PaymentMethod } from '@prisma/client';

// GET /api/payments/[id] - Get a specific payment by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const paymentId = parseInt(params.id);

        if (isNaN(paymentId)) {
            return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
        }

        // Fetch the payment with related data
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                lease: {
                    include: {
                        tenant: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
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
                voucher: true,
            },
        });

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        return NextResponse.json(payment);
    } catch (error) {
        console.error('Error fetching payment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment' },
            { status: 500 }
        );
    }
}

// PATCH /api/payments/[id] - Update a payment
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const paymentId = parseInt(params.id);

        if (isNaN(paymentId)) {
            return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
        }

        // Check if payment exists
        const existingPayment = await prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!existingPayment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Get update data from request body
        const data = await request.json();

        // Prepare update data
        const updateData: Prisma.PaymentUpdateInput = {};

        if (data.amount !== undefined) {
            updateData.amount = data.amount;
        }

        if (data.dueDate !== undefined) {
            updateData.dueDate = new Date(data.dueDate);
        }

        if (data.status !== undefined) {
            updateData.status = data.status as PaymentStatus;
        }

        if (data.paymentMethod !== undefined) {
            updateData.paymentMethod = data.paymentMethod as PaymentMethod;
        }

        if (data.transactionId !== undefined) {
            updateData.transactionId = data.transactionId;
        }

        if (data.paidDate !== undefined) {
            updateData.paidDate = data.paidDate ? new Date(data.paidDate) : null;
        }

        // Update the payment
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: updateData,
            include: {
                lease: {
                    include: {
                        tenant: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        unit: {
                            include: {
                                property: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                voucher: true,
            },
        });

        // If payment is marked as PAID and doesn't have a voucher, create one
        if (
            updatedPayment.status === 'PAID' &&
            updatedPayment.paidDate &&
            !updatedPayment.voucher
        ) {
            const voucherNumber = `V-${updatedPayment.id}-${Date.now()}`;

            await prisma.voucher.create({
                data: {
                    paymentId: updatedPayment.id,
                    voucherNumber,
                    status: 'GENERATED',
                },
            });

            // Fetch the updated payment with the voucher
            const paymentWithVoucher = await prisma.payment.findUnique({
                where: { id: updatedPayment.id },
                include: {
                    lease: {
                        include: {
                            tenant: {
                                include: {
                                    user: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                            unit: {
                                include: {
                                    property: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    voucher: true,
                },
            });

            return NextResponse.json(paymentWithVoucher);
        }

        return NextResponse.json(updatedPayment);
    } catch (error) {
        console.error('Error updating payment:', error);
        return NextResponse.json(
            { error: 'Failed to update payment' },
            { status: 500 }
        );
    }
}

// DELETE /api/payments/[id] - Delete a payment
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is authenticated
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const paymentId = parseInt(params.id);

        if (isNaN(paymentId)) {
            return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
        }

        // Check if payment exists
        const existingPayment = await prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!existingPayment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Delete the payment
        await prisma.payment.delete({
            where: { id: paymentId },
        });

        return NextResponse.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        return NextResponse.json(
            { error: 'Failed to delete payment' },
            { status: 500 }
        );
    }
} 