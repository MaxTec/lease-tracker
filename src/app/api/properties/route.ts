import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { Unit } from "@prisma/client";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        units: {
          some: {}, // Ensures at least one unit exists
        },
      },
      include: {
        units: true,
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, type, landlordId, units } = body;

    if (!name || !address || !type || !landlordId || !units) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        name,
        address,
        type,
        landlordId: parseInt(landlordId),
        units: {
          create: units.map((unit: Unit) => ({
            unitNumber: unit.unitNumber.toString(),
            bedrooms: parseInt(unit.bedrooms.toString()),
            bathrooms: parseInt(unit.bathrooms.toString()),
            squareFeet: parseInt(unit.squareFeet.toString()),
          })),
        },
      },
      include: {
        units: true,
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
