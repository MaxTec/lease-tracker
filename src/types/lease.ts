import { Lease as PrismaLease, User, Property, Document } from "@prisma/client";

export interface Lease extends PrismaLease {
    tenant: {
        user: Pick<User, "name" | "email">;
        phone: string;
        emergencyContact?: string;
    };
    unit: {
        unitNumber: string;
        property: Pick<Property, "name">;
    };
    documents: Pick<Document, "id" | "type" | "fileUrl">[];
}

export interface LeaseFormData {
    tenantId: number;
    unitId: number;
    startDate: string;
    endDate: string;
    rentAmount: number;
    depositAmount: number;
    status: string;
    paymentDay: number;
} 