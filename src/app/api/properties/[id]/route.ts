import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';

interface UnitInput {
    unitNumber: string;
    bedrooms: number | string;
    bathrooms: number | string;
    squareFeet: number | string;
}

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
        const { name, address, type, units } = body;

        if (!name || !address || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // First, delete existing units
        await prisma.unit.deleteMany({
            where: {
                propertyId: parseInt(id),
            },
        });

        // Then update property and create new units
        const property = await prisma.property.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name,
                address,
                type,
                units: units ? {
                    create: units.map((unit: UnitInput) => ({
                        unitNumber: unit.unitNumber.toString(),
                        bedrooms: parseInt(unit.bedrooms.toString()),
                        bathrooms: parseInt(unit.bathrooms.toString()),
                        squareFeet: parseInt(unit.squareFeet.toString()),
                    })),
                } : undefined,
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