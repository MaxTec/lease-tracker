import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { Prisma } from "@prisma/client";

// GET /api/payments - Get all payments
// GET /api/payments?leaseId=X - Get last payment for a specific lease
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leaseId = searchParams.get("leaseId");

    if (leaseId) {
      // Fetch the last payment for the specified lease
      const paymentsByLease = await prisma.payment.findMany({
        where: {
          leaseId: parseInt(leaseId),
          status: "PAID",
        },
        orderBy: {
          dueDate: "desc",
        },
        include: {
          lease: {
            include: {
              unit: {
                include: {
                  property: true,
                },
              },
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
            },
          },
          voucher: true,
        },
      });
      if (paymentsByLease.length > 0) {
        const serializedPayments = paymentsByLease.map((payment) => ({
          ...payment,
          amount:
            payment.amount instanceof Prisma.Decimal
              ? parseFloat(payment.amount.toString())
              : payment.amount,
          lease: {
            ...payment.lease,
            rentAmount:
              payment.lease.rentAmount instanceof Prisma.Decimal
                ? parseFloat(payment.lease.rentAmount.toString())
                : payment.lease.rentAmount,
            depositAmount:
              payment.lease.depositAmount instanceof Prisma.Decimal
                ? parseFloat(payment.lease.depositAmount.toString())
                : payment.lease.depositAmount,
            unit: {
              ...payment.lease.unit,
              property: {
                ...payment.lease.unit.property,
                name: payment.lease.unit.property.name,
              },
            },
          },
        }));
        return NextResponse.json(serializedPayments);
      }
      return NextResponse.json([]);
    }

    // Original code for fetching all payments
    const payments = await prisma.payment.findMany({
      where: {
        status: "PAID",
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
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
          },
        },
        voucher: true,
      },
    });

    // Transform Decimal to number for JSON serialization
    const serializedPayments =
      payments.length === 0
        ? []
        : payments.map((payment) => ({
            ...payment,
            amount:
              payment.amount instanceof Prisma.Decimal
                ? parseFloat(payment.amount.toString())
                : payment.amount,
            lease: {
              ...payment.lease,
              rentAmount:
                payment.lease.rentAmount instanceof Prisma.Decimal
                  ? parseFloat(payment.lease.rentAmount.toString())
                  : payment.lease.rentAmount,
              depositAmount:
                payment.lease.depositAmount instanceof Prisma.Decimal
                  ? parseFloat(payment.lease.depositAmount.toString())
                  : payment.lease.depositAmount,
            },
          }));

    return NextResponse.json(serializedPayments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create a new payment
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.leaseId || !data.tenantId || !data.amount || !data.dueDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        leaseId: data.leaseId,
        tenantId: data.tenantId,
        amount: new Prisma.Decimal(data.amount),
        dueDate: new Date(data.dueDate),
        paidDate: data.paidDate ? new Date(data.paidDate) : null,
        status: data.status || "PENDING",
        paymentMethod: data.paymentMethod || null,
        transactionId: data.transactionId || null,
        paymentNumber: await getNextPaymentNumber(data.leaseId),
      },
      include: {
        lease: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
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
          },
        },
        voucher: true,
      },
    });

    // Transform Decimal to number for JSON serialization
    const serializedPayment = {
      ...payment,
      amount:
        payment.amount instanceof Prisma.Decimal
          ? parseFloat(payment.amount.toString())
          : payment.amount,
      lease: {
        ...payment.lease,
        rentAmount:
          payment.lease.rentAmount instanceof Prisma.Decimal
            ? parseFloat(payment.lease.rentAmount.toString())
            : payment.lease.rentAmount,
        depositAmount:
          payment.lease.depositAmount instanceof Prisma.Decimal
            ? parseFloat(payment.lease.depositAmount.toString())
            : payment.lease.depositAmount,
      },
    };

    // Generate a voucher if payment is PAID
    if (payment.status === "PAID" && payment.paidDate) {
      const voucherNumber = `VCH-${Date.now()}-${payment.id}`;

      const voucher = await prisma.voucher.create({
        data: {
          paymentId: payment.id,
          voucherNumber,
          status: "GENERATED",
        },
      });
      // update serializedPayment with voucher
      serializedPayment.voucher = voucher;
    }

    return NextResponse.json(serializedPayment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

export const getNextPaymentNumber = async (leaseId: number) => {
  const lastPayment = await prisma.payment.findFirst({
    where: {
      leaseId,
      status: "PAID", // Only include PAID payment status
    },
    orderBy: {
      paymentNumber: "desc",
    },
    select: {
      paymentNumber: true,
    },
  });

  return (lastPayment?.paymentNumber ?? 0) + 1;
};
