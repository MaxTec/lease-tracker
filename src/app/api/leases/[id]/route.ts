import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/utils/db";
import { sendLeaseEmail, uploadToR2 } from "@/utils/leaseUtils";

// GET /api/leases/[id] - Get a specific lease by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const session = await getServerSession(authOptions);

    // // Check if user is authenticated
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // // Check if user is admin
    // if (session.user.role === "TENANT") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { id } = await params;
    const leaseId = parseInt(id);

    if (isNaN(leaseId)) {
      return NextResponse.json({ error: "Invalid lease ID" }, { status: 400 });
    }

    // Fetch the lease with related data
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
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
    });

    if (!lease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    return NextResponse.json(lease);
  } catch (error) {
    console.error("Error fetching lease:", error);
    return NextResponse.json(
      { error: "Failed to fetch lease" },
      { status: 500 }
    );
  }
}

// DELETE /api/leases/[id] - Terminate a lease
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const leaseId = parseInt(id);

    if (isNaN(leaseId)) {
      return NextResponse.json({ error: "Invalid lease ID" }, { status: 400 });
    }

    // Check if lease exists
    const existingLease = await prisma.lease.findUnique({
      where: { id: leaseId },
    });

    if (!existingLease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    // Update the lease status to 'TERMINATED'
    const updatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: { status: "TERMINATED" },
    });

    return NextResponse.json(updatedLease);
  } catch (error) {
    console.error("Error terminating lease:", error);
    return NextResponse.json(
      { error: "Failed to terminate lease" },
      { status: 500 }
    );
  }
}

// PUT /api/leases/[id] - Update a lease
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const leaseId = parseInt(id);

    if (isNaN(leaseId)) {
      return NextResponse.json({ error: "Invalid lease ID" }, { status: 400 });
    }

    // Check if lease exists
    const existingLease = await prisma.lease.findUnique({
      where: { id: leaseId },
    });

    if (!existingLease) {
      return NextResponse.json({ error: "Lease not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const signedLeaseFile = formData.get("signedLeaseFile") as File | null;
    const data = JSON.parse(formData.get("data") as string);

    // Handle signed lease file upload if provided
    if (signedLeaseFile) {
      const buffer = Buffer.from(await signedLeaseFile.arrayBuffer());
      const fileName = `signed_lease_${leaseId}_${Date.now()}.pdf`;
      const fileUrl = await uploadToR2(buffer, fileName);

      // Create document record in the database
      await prisma.document.create({
        data: {
          leaseId: leaseId,
          name: "Signed Lease Agreement",
          type: "LEASE_AGREEMENT",
          fileUrl: fileUrl,
        },
      });
    }

    // Update the lease
    const updatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: {
        ...data,
        status: "ACTIVE",
      },
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
                registrationToken: true,
              },
            },
          },
        },
      },
    });
    if (updatedLease.status === "ACTIVE") {
      const registrationUrl = `${process.env.NEXT_PUBLIC_API_URL}/register/new-tenant?token=${updatedLease.tenant.user.registrationToken}`;
      const leaseUrl = `${process.env.NEXT_PUBLIC_API_URL}/leases/${updatedLease.id}`;
      const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/login`;
      await sendLeaseEmail(
        updatedLease.tenant.user.email,
        updatedLease.tenant.user.name,
        leaseUrl,
        loginUrl,
        registrationUrl
      );
    }

    return NextResponse.json(updatedLease);
  } catch (error) {
    console.error("Error updating lease:", error);
    return NextResponse.json(
      { error: "Failed to update lease" },
      { status: 500 }
    );
  }
}
