import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  createRuleSchema,
  updateRulesOrderSchema,
} from "@/lib/validations/rules";
import { ZodError } from "zod";

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
        createdAt: "desc",
      },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // Validate the input data
    const validatedData = createRuleSchema.parse(json);

    const rule = await prisma.leaseRule.create({
      data: {
        ...validatedData,
        isActive: true,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating rule:", error);
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json();

    // Validate the input data
    const validatedData = updateRulesOrderSchema.parse(json);

    // Update rules in sequence
    for (const rule of validatedData.rules) {
      await prisma.leaseRule.update({
        where: { id: Number(rule.id) },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating rules:", error);
    return NextResponse.json(
      { error: "Failed to update rules order" },
      { status: 500 }
    );
  }
}
