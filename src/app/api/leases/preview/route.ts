import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateAmortizationTable } from "@/utils/agreementUtils";

export async function POST(req: Request) {
  try {
    const formData = await req.json();
    console.log(formData);
    const selectedClauses = await prisma.leaseClause.findMany({
      where: {
        id: {
          in: formData.selectedClauses?.map(Number) ?? [],
        },
      },
    });

    const selectedRules = await prisma.leaseRule.findMany({
      where: {
        id: {
          in: formData.selectedRules?.map(Number) ?? [],
        },
      },
    });
    console.log(selectedClauses);
    console.log(selectedRules);

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

    // Get tenant data with user information
    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(formData.tenantId) },
      include: {
        user: true,
      },
    });

    if (!unit || !tenant) {
      return NextResponse.json(
        { error: "Unit or tenant not found" },
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

    // Format the data for the PDF
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
      clauses: selectedClauses.map((clause) => ({
        id: clause.id,
        title: clause.title,
        content: clause.content,
        type: clause.type,
      })),

      rules: selectedRules.map((rule) => ({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        category: rule.category,
      })),
      payments: amortizationTable,
    };

    return NextResponse.json(pdfData);
  } catch (error) {
    console.error("Error processing preview data:", error);
    return NextResponse.json(
      { error: "Failed to process preview data" },
      { status: 500 }
    );
  }
}
