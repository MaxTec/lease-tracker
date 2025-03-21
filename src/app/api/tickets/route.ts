import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        tenantId: user.tenant?.id,
      },
      include: {
        property: true,
        unit: true,
        comments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
      include: {
        tenant: {
          include: {
            leases: {
              where: {
                status: "ACTIVE",
                AND: {
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() }
                }
              },
              include: {
                unit: true
              }
            }
          }
        }
      }
    });

    if (!user?.tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const activeLease = user.tenant.leases[0];
    if (!activeLease) {
      return NextResponse.json(
        { error: "No active lease found for this tenant" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { title, description, priority } = json;
    console.log('activeLease', activeLease);
    // if (unitId !== activeLease.unitId) {
    //   return NextResponse.json(
    //     { error: "Cannot create ticket for a unit not in your active lease" },
    //     { status: 403 }
    //   );
    // }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        tenantId: user.tenant.id,
        propertyId: activeLease.unit.propertyId,
        unitId: activeLease.unitId,
        status: "OPEN"
      },
      include: {
        property: true,
        unit: true,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
