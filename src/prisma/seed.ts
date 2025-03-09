import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const { hash } = bcrypt;

async function main() {
    try {
        // Create admin user
        const adminPassword = await hash('admin123', 10);
        const adminUser = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@leasetracker.com',
                password: adminPassword,
                role: 'ADMIN',
            },
        });

        console.log('Created admin user:', adminUser.email);

        // Create landlord user
        const landlordPassword = await hash('landlord123', 10);
        const landlordUser = await prisma.user.create({
            data: {
                name: 'John Smith',
                email: 'john.smith@example.com',
                password: landlordPassword,
                role: 'USER',
                landlord: {
                    create: {
                        companyName: 'Smith Properties',
                        phone: '555-0100',
                        address: '123 Business Ave',
                    },
                },
            },
        });

        console.log('Created landlord user:', landlordUser.email);

        // Create tenant users
        const tenant1Password = await hash('tenant123', 10);
        const tenant1User = await prisma.user.create({
            data: {
                name: 'Alice Johnson',
                email: 'alice.johnson@example.com',
                password: tenant1Password,
                role: 'USER',
                tenant: {
                    create: {
                        phone: '555-0201',
                        emergencyContact: '555-0202',
                    },
                },
            },
        });

        console.log('Created tenant 1:', tenant1User.email);

        const tenant2Password = await hash('tenant456', 10);
        const tenant2User = await prisma.user.create({
            data: {
                name: 'Bob Wilson',
                email: 'bob.wilson@example.com',
                password: tenant2Password,
                role: 'USER',
                tenant: {
                    create: {
                        phone: '555-0301',
                        emergencyContact: '555-0302',
                    },
                },
            },
        });

        console.log('Created tenant 2:', tenant2User.email);

        // Create properties
        const property1 = await prisma.property.create({
            data: {
                landlordId: (await prisma.landlord.findFirst({
                    where: { userId: landlordUser.id },
                }))!.id,
                name: 'Sunset Apartments',
                address: '456 Sunset Blvd',
                type: 'APARTMENT',
            },
        });

        console.log('Created property:', property1.name);

        const commercialProperty = await prisma.property.create({
            data: {
                landlordId: (await prisma.landlord.findFirst({
                    where: { userId: landlordUser.id },
                }))!.id,
                name: 'Downtown Commercial Center',
                address: '789 Business District',
                type: 'COMMERCIAL',
            },
        });

        console.log('Created commercial property:', commercialProperty.name);

        // Create units
        const unit1 = await prisma.unit.create({
            data: {
                propertyId: property1.id,
                unitNumber: '101',
                bedrooms: 2,
                bathrooms: 1,
                squareFeet: 800,
            },
        });

        console.log('Created unit:', unit1.unitNumber);

        const unit2 = await prisma.unit.create({
            data: {
                propertyId: property1.id,
                unitNumber: '102',
                bedrooms: 2,
                bathrooms: 1,
                squareFeet: 800,
            },
        });

        console.log('Created unit:', unit2.unitNumber);

        // Create leases
        const lease1 = await prisma.lease.create({
            data: {
                unitId: unit1.id,
                tenantId: (await prisma.tenant.findFirst({
                    where: { userId: tenant1User.id },
                }))!.id,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                rentAmount: 1200.00,
                depositAmount: 1200.00,
                paymentDay: 1,
                status: 'ACTIVE',
            },
        });

        console.log('Created lease for unit:', unit1.unitNumber);

        const lease2 = await prisma.lease.create({
            data: {
                unitId: unit2.id,
                tenantId: (await prisma.tenant.findFirst({
                    where: { userId: tenant2User.id },
                }))!.id,
                startDate: new Date('2024-02-01'),
                endDate: new Date('2025-01-31'),
                rentAmount: 1200.00,
                depositAmount: 1200.00,
                paymentDay: 1,
                status: 'ACTIVE',
            },
        });

        console.log('Created lease for unit:', unit2.unitNumber);

        // Create payments
        const payment1 = await prisma.payment.create({
            data: {
                leaseId: lease1.id,
                tenantId: (await prisma.tenant.findFirst({
                    where: { userId: tenant1User.id },
                }))!.id,
                amount: 1200.00,
                dueDate: new Date('2024-03-01'),
                paidDate: new Date('2024-03-01'),
                status: 'PAID',
                paymentMethod: 'BANK_TRANSFER',
                transactionId: 'TRX-001',
            },
        });

        console.log('Created paid payment for lease:', lease1.id);

        // Create voucher for the paid payment
        const voucher = await prisma.voucher.create({
            data: {
                paymentId: payment1.id,
                voucherNumber: `VCH-${Date.now()}-${payment1.id}`,
                status: 'GENERATED',
            },
        });

        console.log('Created voucher:', voucher.voucherNumber);

        // Create a pending payment
        await prisma.payment.create({
            data: {
                leaseId: lease2.id,
                tenantId: (await prisma.tenant.findFirst({
                    where: { userId: tenant2User.id },
                }))!.id,
                amount: 1200.00,
                dueDate: new Date('2024-03-01'),
                status: 'PENDING',
            },
        });

        console.log('Created pending payment for lease:', lease2.id);

        console.log('Seed data created successfully');
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main(); 