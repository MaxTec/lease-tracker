import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const properties = await prisma.property.findMany({
            include: {
                units: true,
            },
        });

        return NextResponse.json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json(
            { error: 'Failed to fetch properties' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, address, type, landlordId, units } = body;

        if (!name || !address || !type || !landlordId || !units) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const property = await prisma.property.create({
            data: {
                name,
                address,
                type,
                landlordId: parseInt(landlordId),
                units: {
                    create: units.map((unit: any) => ({
                        unitNumber: unit.unitNumber,
                        bedrooms: unit.bedrooms,
                        bathrooms: unit.bathrooms,
                        squareFeet: unit.squareFeet,
                    })),
                },
            },
            include: {
                units: true,
            },
        });

        return NextResponse.json(property);
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json(
            { error: 'Failed to create property' },
            { status: 500 }
        );
    }
} 