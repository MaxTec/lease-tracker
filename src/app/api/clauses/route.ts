import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const clauses = await prisma.leaseClause.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(clauses);
  } catch (error) {
    console.error('Error fetching clauses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clauses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, type } = await request.json();

    const clause = await prisma.leaseClause.create({
      data: {
        title,
        content,
        type,
        isActive: true,
      },
    });

    return NextResponse.json(clause);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create clause" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { clauses } = await request.json();
    
    // Update clauses in sequence
    for (const [index, clause] of clauses.entries()) {
      await prisma.leaseClause.update({
        where: { id: clause.id },
        data: { updatedAt: new Date() }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update clauses order" },
      { status: 500 }
    );
  }
} 