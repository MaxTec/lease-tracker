import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rules = await prisma.leaseRule.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, category } = await request.json();

    const rule = await prisma.leaseRule.create({
      data: {
        title,
        description,
        category,
        isActive: true,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { rules } = await request.json();
    
    // Update rules in sequence
    for (const [index, rule] of rules.entries()) {
      await prisma.leaseRule.update({
        where: { id: rule.id },
        data: { updatedAt: new Date() }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update rules order" },
      { status: 500 }
    );
  }
} 