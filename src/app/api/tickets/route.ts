import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get("userRole");
    const userId = searchParams.get("userId");

    const session = await getServerSession(authOptions);
    console.log('session', session);
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    console.log('userRole', userRole);
    console.log('userId', userId);

    // LANDLORD: get all tickets for properties owned by this landlord
    if (userRole === "LANDLORD" && userId) {
      const landlord = await prisma.landlord.findUnique({
        where: { userId: parseInt(userId) },
        select: { id: true },
      });
      if (!landlord) {
        return NextResponse.json([]);
      }
      const tickets = await prisma.ticket.findMany({
        where: {
          property: {
            landlordId: landlord.id,
          },
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
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(tickets);
    }

    // ADMIN: return all tickets
    if (userRole === "ADMIN") {
      const tickets = await prisma.ticket.findMany({
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
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return NextResponse.json(tickets);
    }

    // TENANT: return only tickets for the tenant (current logic)
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
        images: true,
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
    console.log('session', session);
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

    // Check for active tickets (OPEN or IN_PROGRESS)
    const activeTicketsCount = await prisma.ticket.count({
      where: {
        tenantId: user.tenant.id,
        status: {
          in: ["OPEN", "IN_PROGRESS"],
        },
      },
    });
    if (activeTicketsCount >= 2) {
      return NextResponse.json(
        { error: "You can only have 2 active tickets at a time." },
        { status: 403 }
      );
    }

    const json = await request.json();
    const { title, description, priority, images } = json;
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
        images: true,
      },
    });

    // If images are provided, create TicketImage records
    if (Array.isArray(images) && images.length > 0) {
      await Promise.all(
        images.map((img: { url: string; altText?: string }) =>
          prisma.ticketImage.create({
            data: {
              ticketId: ticket.id,
              url: img.url,
              altText: img.altText || null,
            },
          })
        )
      );
      // Re-fetch ticket with images
      const ticketWithImages = await prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: {
          property: true,
          unit: true,
          images: true,
        },
      });
      return NextResponse.json(ticketWithImages);
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
