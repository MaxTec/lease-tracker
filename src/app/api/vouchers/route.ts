import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';

// GET /api/vouchers - Get all vouchers
export async function GET() {
    try {
        const vouchers = await prisma.voucher.findMany({
            include: {
                payment: {
                    include: {
                        lease: {
                            include: {
                                tenant: {
                                    include: {
                                        user: {
                                            select: {
                                                name: true,
                                                email: true
                                            }
                                        }
                                    }
                                },
                                unit: {
                                    include: {
                                        property: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(vouchers);
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch vouchers' },
            { status: 500 }
        );
    }
}

// GET /api/vouchers/[id] - Get a specific voucher by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const voucher = await prisma.voucher.findUnique({
            where: { id },
            include: {
                payment: {
                    include: {
                        lease: {
                            include: {
                                tenant: {
                                    include: {
                                        user: {
                                            select: {
                                                name: true,
                                                email: true
                                            }
                                        }
                                    }
                                },
                                unit: {
                                    include: {
                                        property: true
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

        // Update voucher status to VIEWED if it's not already
        if (voucher.status !== 'VIEWED') {
            await prisma.voucher.update({
                where: { id },
                data: { status: 'VIEWED' }
            });
        }

        return NextResponse.json(voucher);
    } catch (error) {
        console.error('Error fetching voucher:', error);
        return NextResponse.json(
            { error: 'Failed to fetch voucher' },
            { status: 500 }
        );
    }
} 