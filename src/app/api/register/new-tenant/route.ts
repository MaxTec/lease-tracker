import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { hash } from "bcryptjs";
import { z } from "zod";

const registrationSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  phone: z.string().min(8, "Teléfono requerido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const { token, password, phone } = parsed.data;

    // Find user by registration token
    const user = await prisma.user.findFirst({
      where: {
        registrationToken: token,
        registrationTokenExpires: { gte: new Date() },
      },
      include: { tenant: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Token inválido o expirado." }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Update user and tenant
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isActive: true,
        registrationToken: null,
        registrationTokenExpires: null,
      },
    });
    if (user.tenant) {
      await prisma.tenant.update({
        where: { id: user.tenant.id },
        data: { phone },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in new tenant registration:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
} 