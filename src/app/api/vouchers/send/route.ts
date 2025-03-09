import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';

// POST /api/vouchers/send - Send voucher via email
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.voucherId) {
            return NextResponse.json(
                { error: 'Missing voucher ID' },
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
                                        user: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!voucher) {
            return NextResponse.json(
                { error: 'Voucher not found' },
                { status: 404 }
            );
        }

        // In a real application, you would send an email here
        // For now, we'll just update the status
        const updatedVoucher = await prisma.voucher.update({
            where: { id: data.voucherId },
            data: {
                status: 'SENT',
                sentDate: new Date()
            }
        });

        return NextResponse.json({
            message: `Voucher ${voucher.voucherNumber} sent to ${voucher.payment.lease.tenant.user.email}`,
            voucher: updatedVoucher
        });
    } catch (error) {
        console.error('Error sending voucher:', error);
        return NextResponse.json(
            { error: 'Failed to send voucher' },
            { status: 500 }
        );
    }
} 