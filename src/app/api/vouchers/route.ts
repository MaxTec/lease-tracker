import { NextResponse } from 'next/server';
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