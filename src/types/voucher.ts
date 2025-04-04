import { Payment as PrismaPayment, User, Lease } from "@prisma/client";

export interface Payment extends PrismaPayment {
    tenant: {
        user: Pick<User, "name" | "email">;
    };
    lease: Pick<Lease, "id" | "rentAmount">;
}

export interface PaymentFormData {
    leaseId: number;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
} 