import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: {
                id: parseInt(params.id),
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(tenant);
    } catch (error) {
        console.error('Error fetching tenant:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tenant' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, email, phone, emergencyContact } = body;

        if (!name || !email || !phone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get the tenant to find the associated user
        const tenant = await prisma.tenant.findUnique({
            where: { id: parseInt(params.id) },
            include: { user: true },
        });

        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant not found' },
                { status: 404 }
            );
        }

        // Check if email is being changed and if it's already taken
        if (email !== tenant.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already in use' },
                    { status: 400 }
                );
            }
        }

        // Update user and tenant in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update user
            await tx.user.update({
                where: { id: tenant.userId },
                data: {
                    name,
                    email,
                },
            });

            // Update tenant
            const updatedTenant = await tx.tenant.update({
                where: { id: parseInt(params.id) },
                data: {
                    phone,
                    emergencyContact,
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            return updatedTenant;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating tenant:', error);
        return NextResponse.json(
            { error: 'Failed to update tenant' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get the tenant to find the associated user
        const tenant = await prisma.tenant.findUnique({
            where: { id: parseInt(params.id) },
            include: { user: true },
        });

        if (!tenant) {
            return NextResponse.json(
                { error: 'Tenant not found' },
                { status: 404 }
            );
        }

        // Delete tenant and user in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete tenant first (due to foreign key constraint)
            await tx.tenant.delete({
                where: { id: parseInt(params.id) },
            });

            // Delete user
            await tx.user.delete({
                where: { id: tenant.userId },
            });
        });

        return NextResponse.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        console.error('Error deleting tenant:', error);
        return NextResponse.json(
            { error: 'Failed to delete tenant' },
            { status: 500 }
        );
    }
} 