import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { Prisma } from "@prisma/client";
import { differenceInMonths } from "date-fns";
import { uploadToR2 } from "@/utils/leaseUtils";
import { sendLeaseEmail } from "@/utils/leaseUtils";
import { randomBytes } from "crypto";
import { getAccurateLeaseMonths } from "@/utils/leaseUtils";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includePayments = searchParams.get("include") === "payments";
    const userRole = searchParams.get("userRole");
    const userId = searchParams.get("userId");

    const whereClause: Prisma.LeaseWhereInput = {
      status: {
        in: ["ACTIVE", "PENDING"],
      },
    };

    if (userRole === "LANDLORD" && userId) {
      // Find landlordId by userId
      const landlord = await prisma.landlord.findUnique({
        where: { userId: parseInt(userId) },
        select: { id: true },
      });
      if (!landlord) {
        return NextResponse.json([]);
      }
      whereClause.unit = { property: { landlordId: landlord.id } };
    }
    // If ADMIN, no extra filter (all leases)
    // If TENANT, you can add tenantId filter here if needed

    const leases = await prisma.lease.findMany({
      where: whereClause,
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
        documents: {
          where: {
            type: "LEASE_AGREEMENT",
          },
          select: {
            id: true,
            type: true,
            fileUrl: true,
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
      tenantName,
      tenantEmail,
      tenantPhone,
      startDate,
      endDate,
      rentAmount,
      depositAmount,
      paymentDay,
      hasExistingLease,
    } = body;

    // Validate required fields
    if (
      !unitId ||
      (!tenantId && (!tenantName || !tenantEmail || !tenantPhone)) ||
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

    let finalTenantId = tenantId;
    let registrationToken: string | null = null;
    let registrationTokenExpires: Date | null = null;
    let newUser = null;
    // If tenantId is not provided, create a new user and tenant
    if (!tenantId) {
      // Generate registration token and expiry (48 hours)
      registrationToken = randomBytes(32).toString("hex");
      registrationTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);
      // Create user
      newUser = await prisma.user.create({
        data: {
          name: tenantName,
          email: tenantEmail,
          role: "TENANT",
          registrationToken,
          registrationTokenExpires,
        },
      });
      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          userId: newUser.id,
          phone: tenantPhone,
        },
      });
      finalTenantId = tenant.id;
    }

    // Check if tenant already has an active lease
    const existingTenantLease = await prisma.lease.findFirst({
      where: {
        tenantId: parseInt(finalTenantId),
        status: "ACTIVE",
      },
    });

    if (existingTenantLease) {
      return NextResponse.json(
        { error: "Tenant already has an active lease" },
        { status: 400 }
      );
    }

    // Check if unit is already taken (has an active lease)
    const existingUnitLease = await prisma.lease.findFirst({
      where: {
        unitId: parseInt(unitId),
        status: "ACTIVE",
      },
    });

    if (existingUnitLease) {
      return NextResponse.json(
        { error: "Unit is already occupied with an active lease" },
        { status: 400 }
      );
    }

    // Create the lease
    const totalPayments = getAccurateLeaseMonths(
      new Date(startDate),
      new Date(endDate)
    );
    const lease = await prisma.lease.create({
      data: {
        unitId: parseInt(unitId),
        tenantId: parseInt(finalTenantId),
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

    // Only create rules and clauses if there's no existing lease
    if (!hasExistingLease) {
      const selectedRules = body.selectedRules || [];
      const selectedClauses = body.selectedClauses || [];

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
      if (leaseRules.length > 0) {
        await prisma.leasesToRules.createMany({
          data: leaseRules,
        });
      }

      // link leaseClauses to lease
      if (leaseClauses.length > 0) {
        await prisma.leasesToClauses.createMany({
          data: leaseClauses,
        });
      }
    }

    // Send registration email if new user
    if (newUser && registrationToken) {
      const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/register/new-tenant?token=${registrationToken}`;
      const leaseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/leases/${lease.id}`;
      const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
      await sendLeaseEmail(
        tenantEmail,
        tenantName,
        leaseUrl,
        loginUrl,
        registrationUrl
      );
    }

    return NextResponse.json(lease);
  } catch (error) {
    console.error("Error creating lease:", error);
    return NextResponse.json(
      { error: "Failed to create lease" },
      { status: 500 }
    );
  }
}
