import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateAmortizationTable } from "@/utils/agreementUtils";

// Type for preview tenant (union of DB and mock)
type TenantPreview = {
  user: {
    name: string;
    email: string;
  };
  phone: string;
  emergencyContact?: string;
};

export async function POST(req: Request) {
  try {
    const formData = await req.json();
    const { tenantMode, tenantId, tenantName, tenantEmail, tenantPhone, tenantEmergencyContact } = formData;

    // Validate tenantMode
    if (!tenantMode || (tenantMode !== 'existing' && tenantMode !== 'new')) {
      return NextResponse.json({ error: 'Invalid or missing tenantMode' }, { status: 400 });
    }

    let tenant: TenantPreview | null = null;

    if (tenantMode === 'existing') {
      if (!tenantId) {
        return NextResponse.json({ error: 'tenantId is required for existing tenant mode' }, { status: 400 });
      }
      const dbTenant = await prisma.tenant.findUnique({
        where: { id: Number(tenantId) },
        include: { user: true },
      });
      if (!dbTenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
      }
      tenant = {
        user: {
          name: dbTenant.user.name,
          email: dbTenant.user.email,
        },
        phone: dbTenant.phone,
        emergencyContact: dbTenant.emergencyContact ?? '',
      };
    } else if (tenantMode === 'new') {
      if (!tenantName || !tenantEmail || !tenantPhone) {
        return NextResponse.json({ error: 'tenantName, tenantEmail, and tenantPhone are required for new tenant mode' }, { status: 400 });
      }
      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({ where: { email: tenantEmail } });
      if (existingUser) {
        return NextResponse.json({ error: 'A user with this email already exists. Please use existing tenant mode.' }, { status: 400 });
      }
      // Mock tenant and user for preview (do not persist)
      tenant = {
        user: {
          name: tenantName,
          email: tenantEmail,
        },
        phone: tenantPhone,
        emergencyContact: tenantEmergencyContact || '',
      };
    }

    // Get unit data with related property and landlord information
    const unit = await prisma.unit.findUnique({
      where: { id: Number(formData.unitId) },
      include: {
        property: {
          include: {
            landlord: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: 'Unit not found' },
        { status: 404 }
      );
    }

    // Generate amortization table
    const amortizationTable = generateAmortizationTable(
      formData.startDate,
      formData.endDate,
      parseInt(formData.paymentDay) || 1,
      parseFloat(formData.rentAmount) || 0
    );

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant data missing' }, { status: 500 });
    }

    const pdfData = {
      // Landlord information
      landlordName: unit.property.landlord.user.name,
      landlordCompany: unit.property.landlord.companyName,
      landlordPhone: unit.property.landlord.phone,
      landlordAddress: unit.property.landlord.address,

      // Tenant information
      tenantName: tenant.user.name,
      tenantPhone: tenant.phone,
      tenantEmail: tenant.user.email,
      emergencyContact: tenant.emergencyContact,

      // Property and unit information
      propertyName: unit.property.name,
      propertyAddress: unit.property.address,
      propertyType: unit.property.type,
      unitNumber: unit.unitNumber,

      // Lease details
      startDate: formData.startDate,
      endDate: formData.endDate,
      rentAmount: formData.rentAmount,
      depositAmount: formData.depositAmount,
      paymentDay: formData.paymentDay,

      // Selected clauses and rules
      clauses: (await prisma.leaseClause.findMany({
        where: {
          id: {
            in: formData.selectedClauses?.map(Number) ?? [],
          },
        },
      })).map((clause) => ({
        id: clause.id,
        title: clause.title,
        content: clause.content,
        type: clause.type,
      })),

      rules: (await prisma.leaseRule.findMany({
        where: {
          id: {
            in: formData.selectedRules?.map(Number) ?? [],
          },
        },
      })).map((rule) => ({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        category: rule.category,
      })),
      payments: amortizationTable,
    };

    return NextResponse.json(pdfData);
  } catch (error) {
    console.error('Error processing preview data:', error);
    return NextResponse.json(
      { error: 'Failed to process preview data' },
      { status: 500 }
    );
  }
}
