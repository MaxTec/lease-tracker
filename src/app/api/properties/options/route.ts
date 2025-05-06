import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get("userRole");
    const userId = searchParams.get("userId");

    let properties;
    if (userRole === "LANDLORD" && userId) {
      // Find landlordId by userId
      const landlord = await prisma.landlord.findUnique({
        where: { userId: parseInt(userId) },
        select: { id: true },
      });
      if (!landlord) {
        return NextResponse.json([]);
      }
      properties = await prisma.property.findMany({
        where: { landlordId: landlord.id },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
    } else {
      // ADMIN or no role: return all properties
      properties = await prisma.property.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
    }

    const options = properties.map((property) => ({
      value: property.id.toString(),
      label: property.name,
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error("Error fetching property options:", error);
    return NextResponse.json(
      { error: "Failed to fetch property options" },
      { status: 500 }
    );
  }
} 