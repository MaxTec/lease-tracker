import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

// GET /api/vouchers/[voucherNumber] - Get a specific voucher by voucherNumber
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ voucherNumber: string }> }
) {
  // context: { params: { voucherNumber: string } }
  try {
    const { voucherNumber } = await params;
    console.log("Searching for voucherNumber:", voucherNumber);

    // First, let's check if the voucher exists without includes
    const voucherExists = await prisma.voucher.findUnique({
      where: { voucherNumber },
      select: { id: true }
    });

    if (!voucherExists) {
      return NextResponse.json(
        { error: "Voucher not found", redirect: "/dashboard" },
        { status: 404 }
      );
    }

    // Now get the full voucher with all includes
    const voucher = await prisma.voucher.findUnique({
      where: { voucherNumber },
      include: {
        payment: {
          include: {
            lease: {
              include: {
                tenant: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        email: true
                      }
                    }
                  }
                },
                unit: {
                  include: {
                    property: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // If voucher or any required nested data is missing, return 404
    if (!voucher || !voucher.payment || !voucher.payment.lease) {
      return NextResponse.json(
        { error: "Voucher or required data not found", redirect: "/dashboard" },
        { status: 404 }
      );
    }

    // Update voucher status to VIEWED if it's not already
    if (voucher.status !== "VIEWED") {
      await prisma.voucher.update({
        where: { voucherNumber },
        data: { status: "VIEWED" },
      });
    }

    return NextResponse.json(voucher);
  } catch (error) {
    console.error("Error fetching voucher:", error);
    return NextResponse.json(
      { error: "Failed to fetch voucher", redirect: "/dashboard" },
      { status: 500 }
    );
  }
}
