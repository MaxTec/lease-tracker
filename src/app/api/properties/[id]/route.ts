import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const property = await prisma.property.findUnique({
            where: {
                id: parseInt(id),
            },
            include: {
                units: true,
            },
        });

        if (!property) {
            return NextResponse.json(
                { error: 'Property not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        return NextResponse.json(
            { error: 'Failed to fetch property' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, address, type } = body;

        if (!name || !address || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const property = await prisma.property.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name,
                address,
                type,
            },
            include: {
                units: true,
            },
        });

        return NextResponse.json(property);
    } catch (error) {
        console.error('Error updating property:', error);
        return NextResponse.json(
            { error: 'Failed to update property' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.property.delete({
            where: {
                id: parseInt(id),
            },
        });

        return NextResponse.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        return NextResponse.json(
            { error: 'Failed to delete property' },
            { status: 500 }
        );
    }
} 