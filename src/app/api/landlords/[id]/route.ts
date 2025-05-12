import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Await params to access id
        const landlord = await prisma.landlord.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!landlord) {
            return NextResponse.json(
                { error: 'Landlord not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(landlord);
    } catch (error) {
        console.error('Error fetching landlord:', error);
        return NextResponse.json(
            { error: 'Failed to fetch landlord' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { name, email, phone, address, companyName } = body;

        if (!name || !email || !phone || !address) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { id } = await params; // Await params to access id
        const landlord = await prisma.landlord.findUnique({
            where: { id: parseInt(id) },
            include: { user: true },
        });

        if (!landlord) {
            return NextResponse.json(
                { error: 'Landlord not found' },
                { status: 404 }
            );
        }

        // Update user and landlord in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update user
            await tx.user.update({
                where: { id: landlord.userId },
                data: {
                    name,
                    email,
                },
            });

            // Update landlord
            const updatedLandlord = await tx.landlord.update({
                where: { id: parseInt(id) },
                data: {
                    phone,
                    address,
                    companyName,
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

            return updatedLandlord;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating landlord:', error);
        return NextResponse.json(
            { error: 'Failed to update landlord' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Await params to access id
        const landlord = await prisma.landlord.findUnique({
            where: { id: parseInt(id) },
        });

        if (!landlord) {
            return NextResponse.json(
                { error: 'Landlord not found' },
                { status: 404 }
            );
        }

        // Delete landlord and associated user in a transaction
        await prisma.$transaction(async (tx) => {
            await tx.landlord.delete({
                where: { id: parseInt(id) },
            });
            await tx.user.delete({
                where: { id: landlord.userId },
            });
        });

        return NextResponse.json({ message: 'Landlord deleted successfully' });
    } catch (error) {
        console.error('Error deleting landlord:', error);
        return NextResponse.json(
            { error: 'Failed to delete landlord' },
            { status: 500 }
        );
    }
} 