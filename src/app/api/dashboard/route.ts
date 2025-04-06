import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseISO } from "date-fns";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const propertyId = searchParams.get("propertyId");

    // Base where clause for date filtering
    const dateFilter = startDate && endDate
      ? {
        paidDate: {
          gte: parseISO(startDate),
          lte: parseISO(endDate),
        },
      }
      : {};

    // Property filter through Unit model
    const propertyFilter = propertyId
      ? {
        unit: {
          propertyId: parseInt(propertyId),
        },
      }
      : {};

    const [
      totalProperties,
      totalUnits,
      activeLeases,
      totalPayments,
      occupancyRate,
      rentCollection,
      leaseExpirations,
      rentCollectionByMonth,
      ticketMetrics,
      ticketsByStatus,
    ] = await Promise.all([
      // Total properties
      prisma.property.count(),

      // Total units (filtered by property if specified)
      prisma.unit.count({
        where: propertyId ? { propertyId: parseInt(propertyId) } : {},
      }),

      // Active leases (filtered by property through unit)
      prisma.lease.count({
        where: {
          status: "ACTIVE",
          ...propertyFilter,
          ...(startDate && endDate
            ? {
              startDate: {
                lte: parseISO(endDate),
              },
              endDate: {
                gte: parseISO(startDate),
              },
            }
            : {}),
        },
      }),

      // Total payments (filtered by property through lease -> unit)
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          ...dateFilter,
          lease: {
            ...propertyFilter,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Occupancy rate (filtered by property through unit)
      prisma.lease.groupBy({
        by: ["status"],
        where: {
          ...propertyFilter,
          ...(startDate && endDate
            ? {
              startDate: {
                lte: parseISO(endDate),
              },
              endDate: {
                gte: parseISO(startDate),
              },
            }
            : {}),
        },
        _count: true,
      }),

      // Rent collection By Status (filtered by property through lease -> unit)
      prisma.payment.groupBy({
        by: ["status"],
        where: {
          ...dateFilter,
          lease: {
            ...propertyFilter,
          },
          paidDate: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Lease expirations (filtered by property through unit)
      prisma.lease.findMany({
        where: {
          status: "ACTIVE",
          ...propertyFilter,
          endDate: {
            gte: new Date(),
            lte: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          },
          ...(startDate && endDate
            ? {
              startDate: {
                lte: parseISO(endDate),
              },
              endDate: {
                gte: parseISO(startDate),
              },
            }
            : {}),
        },
        select: {
          endDate: true,
          rentAmount: true,
        },
        orderBy: {
          endDate: "asc",
        },
      }),

      // rentCollectionByMonth with date filtering (filtered by property through lease -> unit)
      prisma.$queryRaw`
        SELECT DATE_FORMAT(p.paidDate, '%Y-%m') AS month, SUM(p.amount) AS totalAmount
        FROM Payment p
        JOIN Lease l ON p.leaseId = l.id
        JOIN Unit u ON l.unitId = u.id
        WHERE p.status = 'PAID'
        ${propertyId ? Prisma.sql`AND u.propertyId = ${parseInt(propertyId)}` : Prisma.empty}
        ${startDate && endDate ? Prisma.sql`AND p.paidDate BETWEEN ${parseISO(startDate)} AND ${parseISO(endDate)}` : Prisma.empty}
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `,

      // Ticket metrics
      prisma.ticket.aggregate({
        where: {
          ...(propertyId ? { propertyId: parseInt(propertyId) } : {}),
          ...(startDate && endDate
            ? {
              createdAt: {
                gte: parseISO(startDate),
                lte: parseISO(endDate),
              },
            }
            : {}),
        },
        _count: true,
      }),

      // Tickets by status
      prisma.ticket.groupBy({
        by: ["status"],
        where: {
          ...(propertyId ? { propertyId: parseInt(propertyId) } : {}),
          ...(startDate && endDate
            ? {
              createdAt: {
                gte: parseISO(startDate),
                lte: parseISO(endDate),
              },
            }
            : {}),
        },
        _count: true,
      }),
    ]);

    // Calculate occupancy rate
    const totalLeases = occupancyRate.reduce((acc, curr) => acc + curr._count, 0);
    const activeLeasesCount = occupancyRate.find(item => item.status === "ACTIVE")?._count || 0;
    const calculatedOccupancyRate = totalLeases > 0 ? (activeLeasesCount / totalLeases) * 100 : 0;

    return NextResponse.json({
      metrics: {
        totalProperties,
        totalUnits,
        activeLeases,
        totalPayments: totalPayments._sum.amount || 0,
        occupancyRate: calculatedOccupancyRate,
        totalTickets: ticketMetrics._count,
      },
      rentCollection,
      leaseExpirations,
      occupancyBreakdown: occupancyRate,
      rentCollectionByMonth,
      ticketsByStatus,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
