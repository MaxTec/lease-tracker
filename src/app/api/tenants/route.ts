import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { hash } from "bcryptjs";
import { UserRole, Prisma, LeaseStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get("userRole");
    const userId = searchParams.get("userId");
    const excludeActiveLease = searchParams.get("excludeActiveLease") === "true";

    let whereClause: Prisma.TenantWhereInput = {};
    let landlordLeaseFilter: Prisma.TenantWhereInput | undefined;
    if (userRole === "LANDLORD" && userId) {
      const landlord = await prisma.landlord.findUnique({
        where: { userId: parseInt(userId) },
        select: { id: true },
      });
      if (!landlord) {
        return NextResponse.json([]);
      }
      landlordLeaseFilter = {
        leases: {
          some: {
            unit: {
              property: {
                landlordId: landlord.id,
              },
            },
          },
        },
      };
    }
    const excludeActiveLeaseFilter: Prisma.TenantWhereInput | undefined = excludeActiveLease
      ? { leases: { none: { status: { in: [LeaseStatus.ACTIVE, LeaseStatus.PENDING] } } } }
      : undefined;

    if (landlordLeaseFilter && excludeActiveLeaseFilter) {
      whereClause = { AND: [landlordLeaseFilter, excludeActiveLeaseFilter] };
    } else if (landlordLeaseFilter) {
      whereClause = landlordLeaseFilter;
    } else if (excludeActiveLeaseFilter) {
      whereClause = excludeActiveLeaseFilter;
    }

    const tenants = await prisma.tenant.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("Tenants:", tenants);

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      emergencyContact,
      isActive = false,
    } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user and tenant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const userData = {
        name,
        email,
        password: password ? await hash(password, 12) : null,
        role: "TENANT" as UserRole,
        isActive,
      };

      const user = await tx.user.create({
        data: userData,
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
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 }
    );
  }
}
