import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { hash } from "bcrypt";

export async function GET() {
  try {
    const landlords = await prisma.landlord.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(landlords);
  } catch (error) {
    console.error("Error fetching landlords:", error);
    return NextResponse.json(
      { error: "Failed to fetch landlords" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, companyName } = body;

    if (!name || !email || !password || !phone || !address) {
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

    // Create user and landlord in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const hashedPassword = await hash(password, 12);
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "LANDLORD",
        },
      });

      // Create landlord
      const landlord = await tx.landlord.create({
        data: {
          userId: user.id,
          phone,
          address,
          companyName,
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

      return landlord;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating landlord:", error);
    return NextResponse.json(
      { error: "Failed to create landlord" },
      { status: 500 }
    );
  }
}
