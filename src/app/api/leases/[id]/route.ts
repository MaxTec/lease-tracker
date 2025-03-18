import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/utils/db';

// GET /api/leases/[id] - Get a specific lease by ID
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

        const leaseId = parseInt(params.id);

        if (isNaN(leaseId)) {
            return NextResponse.json({ error: 'Invalid lease ID' }, { status: 400 });
        }

        // Fetch the lease with related data
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: {
                unit: {
                    include: {
                        property: true,
                    },
                },
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
            },
        });

        if (!lease) {
            return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
        }

        return NextResponse.json(lease);
    } catch (error) {
        console.error('Error fetching lease:', error);
        return NextResponse.json(
            { error: 'Failed to fetch lease' },
            { status: 500 }
        );
    }
}

// PATCH /api/leases/[id] - Update a lease
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

        const leaseId = parseInt(params.id);

        if (isNaN(leaseId)) {
            return NextResponse.json({ error: 'Invalid lease ID' }, { status: 400 });
        }

        // Check if lease exists
        const existingLease = await prisma.lease.findUnique({
            where: { id: leaseId },
        });

        if (!existingLease) {
            return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
        }

        // Get update data from request body
        const data = await request.json();

        // Update the lease
        const updatedLease = await prisma.lease.update({
            where: { id: leaseId },
            data,
            include: {
                unit: {
                    include: {
                        property: true,
                    },
                },
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
            },
        });

        return NextResponse.json(updatedLease);
    } catch (error) {
        console.error('Error updating lease:', error);
        return NextResponse.json(
            { error: 'Failed to update lease' },
            { status: 500 }
        );
    }
}

// DELETE /api/leases/[id] - Terminate a lease
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

        const leaseId = parseInt(params.id);

        if (isNaN(leaseId)) {
            return NextResponse.json({ error: 'Invalid lease ID' }, { status: 400 });
        }

        // Check if lease exists
        const existingLease = await prisma.lease.findUnique({
            where: { id: leaseId },
        });

        if (!existingLease) {
            return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
        }

        // Update the lease status to 'TERMINATED'
        const updatedLease = await prisma.lease.update({
            where: { id: leaseId },
            data: { status: 'TERMINATED' },
        });

        return NextResponse.json(updatedLease);
    } catch (error) {
        console.error('Error terminating lease:', error);
        return NextResponse.json(
            { error: 'Failed to terminate lease' },
            { status: 500 }
        );
    }
} 