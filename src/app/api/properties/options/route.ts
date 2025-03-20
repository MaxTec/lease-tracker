import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

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