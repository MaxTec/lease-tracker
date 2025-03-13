import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/db';
import { hash } from 'bcryptjs';

export async function GET(request: NextRequest) {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tenants' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password, phone, emergencyContact } = body;

        if (!name || !email || !password || !phone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user with email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Create user and tenant in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const hashedPassword = await hash(password, 12);
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'USER',
                },
            });

            // Create tenant
            const tenant = await tx.tenant.create({
                data: {
                    userId: user.id,
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

            return tenant;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error creating tenant:', error);
        return NextResponse.json(
            { error: 'Failed to create tenant' },
            { status: 500 }
        );
    }
} 