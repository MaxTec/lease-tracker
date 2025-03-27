import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.json();
    // Example of the form data
    // {
    //     "unitId": "1",
    //     "tenantId": "2",
    //     "startDate": "2025-03-01",
    //     "endDate": "2026-02-28",
    //     "rentAmount": "1000",
    //     "depositAmount": "1000",
    //     "paymentDay": "1",
    //     "customEndDate": false,
    //     "selectedRules": [
    //         "10",
    //         "9",
    //         "6",
    //         "5",
    //         "3"
    //     ],
    //     "selectedClauses": [
    //         "8",
    //         "7",
    //         "6",
    //         "5",
    //         "2",
    //         "1"
    //     ],
    //     "customClauses": [],
    //     "agreementVerified": false
    // }
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
                user: true
              }
            }
          }
        }
      }
    });

    // Get tenant data with user information
    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(formData.tenantId) },
      include: {
        user: true
      }
    });

    if (!unit || !tenant) {
      return NextResponse.json(
        { error: "Unit or tenant not found" },
        { status: 404 }
      );
    }

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
      clauses: selectedClauses.map(clause => ({
        id: clause.id,
        title: clause.title,
        content: clause.content,
        type: clause.type
      })),

      rules: selectedRules.map(rule => ({
        id: rule.id,
        title: rule.title,
        description: rule.description,
        category: rule.category
      }))
    };

    console.log(pdfData);

    return NextResponse.json(pdfData);
  } catch (error) {
    console.error("Error processing preview data:", error);
    return NextResponse.json(
      { error: "Failed to process preview data" },
      { status: 500 }
    );
  }
}
