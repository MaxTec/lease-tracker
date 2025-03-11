import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { Prisma } from '@prisma/client';
import { differenceInMonths } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const includePayments = searchParams.get('include') === 'payments';

        const leases = await prisma.lease.findMany({
            where: {
                status: 'ACTIVE',
            },
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
                payments: includePayments ? {
                    where: {
                        status: 'PAID',
                    },
                    orderBy: {
                        dueDate: 'desc',
                    },
                } : false,
                _count: {
                    select: {
                        payments: {
                            where: {
                                status: 'PAID'
                            }
                        },
                    },
                },
            },
        });

        // Calculate overdue months and transform decimal values
        const today = new Date();
        const serializedLeases = leases.map(lease => {
            // Find the most recent payment
            const lastPayment = lease.payments?.[0];
            
            // Calculate overdue months
            let overdueMonths = 0;
            if (lastPayment) {
                const lastDueDate = new Date(lastPayment.dueDate);
                if (lastPayment.status !== 'PAID' && lastDueDate < today) {
                    overdueMonths = differenceInMonths(today, lastDueDate);
                }
            } else {
                // If no payments exist, calculate from lease start date
                const startDate = new Date(lease.startDate);
                if (startDate < today) {
                    overdueMonths = differenceInMonths(today, startDate);
                }
            }

            return {
                ...lease,
                rentAmount: lease.rentAmount instanceof Prisma.Decimal
                    ? parseFloat(lease.rentAmount.toString())
                    : lease.rentAmount,
                depositAmount: lease.depositAmount instanceof Prisma.Decimal
                    ? parseFloat(lease.depositAmount.toString())
                    : lease.depositAmount,
                overdueMonths: overdueMonths > 0 ? overdueMonths : 0,
                // Remove the payments array if it was included
                payments: undefined,
            };
        });

        return NextResponse.json(serializedLeases);
    } catch (error) {
        console.error('Error fetching leases:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leases' },
            { status: 500 }
        );
    }
} 