import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { Prisma } from "@prisma/client";
import { differenceInMonths, addMonths, isEqual, addDays } from "date-fns";
import { uploadToR2 } from "@/utils/leaseUtils";
// import { generateLeasePDF, sendLeaseEmail } from '@/utils/leaseUtils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includePayments = searchParams.get("include") === "payments";

    const leases = await prisma.lease.findMany({
      where: {
        status: {
          in: ["ACTIVE", "PENDING"],
        },
      },
      include: {
        tenant: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        unit: {
          include: {
            property: true,
          },
        },
        payments: includePayments
          ? {
              where: {
                status: "PAID",
              },
              orderBy: {
                dueDate: "desc",
              },
            }
          : false,
        _count: {
          select: {
            payments: {
              where: {
                status: "PAID",
              },
            },
          },
        },
      },
    });

    // Calculate overdue months and transform decimal values
    const today = new Date();
    const serializedLeases = leases.map((lease) => {
      // Find the most recent payment
      const lastPayment = lease.payments?.[0];

      // Calculate overdue months
      let overdueMonths = 0;
      if (lastPayment) {
        const lastDueDate = new Date(lastPayment.dueDate);
        if (lastPayment.status !== "PAID" && lastDueDate < today) {
          overdueMonths = differenceInMonths(today, lastDueDate);
        }
      } else {
        // If no payments exist, calculate from lease start date
        const startDate = new Date(lease.startDate);
        if (startDate < today) {
          overdueMonths = differenceInMonths(today, startDate);
        }
      }
      return {
        ...lease,
        rentAmount:
          lease.rentAmount instanceof Prisma.Decimal
            ? parseFloat(lease.rentAmount.toString())
            : lease.rentAmount,
        depositAmount:
          lease.depositAmount instanceof Prisma.Decimal
            ? parseFloat(lease.depositAmount.toString())
            : lease.depositAmount,
        overdueMonths: overdueMonths > 0 ? overdueMonths : 0,
        // Remove the payments array if it was included
        payments: undefined,
      };
    });

    return NextResponse.json(serializedLeases);
  } catch (error) {
    console.error("Error fetching leases:", error);
    return NextResponse.json(
      { error: "Failed to fetch leases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const body = JSON.parse(formData.get("data") as string);
    const signedLeaseFile = formData.get("signedLeaseFile") as File | null;

    const {
      unitId,
      tenantId,
      startDate,
      endDate,
      rentAmount,
      depositAmount,
      paymentDay,
    } = body;

    // Validate required fields
    if (
      !unitId ||
      !tenantId ||
      !startDate ||
      !endDate ||
      !rentAmount ||
      !depositAmount ||
      !paymentDay
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const selectedRules = body.selectedRules;
    const selectedClauses = body.selectedClauses;

    // Create the lease
    const totalPayments = getAccurateLeaseMonths(
      new Date(startDate),
      new Date(endDate)
    );
    const lease = await prisma.lease.create({
      data: {
        unitId: parseInt(unitId),
        tenantId: parseInt(tenantId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: new Prisma.Decimal(rentAmount),
        depositAmount: new Prisma.Decimal(depositAmount),
        paymentDay: parseInt(paymentDay),
        totalPayments: totalPayments > 0 ? totalPayments : 0,
        status: "PENDING",
      },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    // Handle signed lease file upload if provided
    if (signedLeaseFile) {
      const buffer = Buffer.from(await signedLeaseFile.arrayBuffer());
      const fileName = `signed_lease_${lease.id}_${Date.now()}.pdf`;
      const fileUrl = await uploadToR2(buffer, fileName);

      // Create document record in the database
      const document = await prisma.document.create({
        data: {
          leaseId: lease.id,
          name: "Signed Lease Agreement",
          type: "LEASE_AGREEMENT",
          fileUrl: fileUrl,
        },
      });

      if (lease.status === "PENDING" && document) {
        lease.status = "ACTIVE";
        await prisma.lease.update({
          where: { id: lease.id },
          data: { status: "ACTIVE" },
        });
      }
    }

    const leaseRules = selectedRules.map((ruleId: string, index: number) => ({
      leaseId: lease.id,
      ruleId: parseInt(ruleId),
      order: index,
    }));

    const leaseClauses = selectedClauses.map(
      (clauseId: string, index: number) => ({
        leaseId: lease.id,
        clauseId: parseInt(clauseId),
        order: index,
      })
    );

    // link leaseRules to lease
    await prisma.leasesToRules.createMany({
      data: leaseRules,
    });

    // link leaseClauses to lease
    await prisma.leasesToClauses.createMany({
      data: leaseClauses,
    });

    // const pdfBuffer = await generateLeasePDF(leaseData);
    // const fileName = `lease_${lease.id}_${Date.now()}.pdf`;
    // const leaseUrl = await uploadToR2(pdfBuffer, fileName);

    // // Send email to tenant
    // const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
    // await sendLeaseEmail(
    //     lease.tenant.user.email,
    //     lease.tenant.user.name,
    //     leaseUrl,
    //     loginUrl
    // );

    // Create initial payment records for the lease period
    // const start = new Date(startDate);
    // const end = new Date(endDate);
    // const payments = [];

    // for (let date = new Date(start); date <= end; date.setMonth(date.getMonth() + 1)) {
    //     const dueDate = new Date(date);
    //     dueDate.setDate(paymentDay);

    //     if (dueDate >= start && dueDate <= end) {
    //         payments.push({
    //             leaseId: lease.id,
    //             tenantId: parseInt(tenantId),
    //             amount: rentAmount,
    //             dueDate,
    //             status: 'PENDING' as const,
    //         });
    //     }
    // }

    // await prisma.payment.createMany({
    //     data: payments,
    // });

    return NextResponse.json(lease);
  } catch (error) {
    console.error("Error creating lease:", error);
    return NextResponse.json(
      { error: "Failed to create lease" },
      { status: 500 }
    );
  }
}

export const getAccurateLeaseMonths = (start: Date, end: Date): number => {
  const cleanEnd = addMonths(start, differenceInMonths(end, start));

  const isExactEnd = isEqual(end, cleanEnd);

  // Case: user set exact monthly period (e.g. Apr 1 → Oct 1)
  if (isExactEnd) return differenceInMonths(end, start);

  // Case: ends 1 day before full month (e.g. Mar 31 vs Apr 1)
  return differenceInMonths(addDays(end, 1), start);
};
