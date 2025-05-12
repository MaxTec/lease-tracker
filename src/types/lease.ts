import { Lease as PrismaLease, User, Document } from "@prisma/client";

export interface Lease extends Omit<PrismaLease, 'rentAmount' | 'depositAmount' | 'startDate' | 'endDate'> {
    rentAmount: number;
    depositAmount: number;
    startDate: Date;
    endDate: Date;
    tenant: {
        user: Pick<User, "name" | "email">;
        phone: string;
        emergencyContact?: string | null;
    };
    unit: {
        unitNumber: string;
        bedrooms?: number;
        bathrooms?: number;
        squareFeet?: number;
        property: {
            name: string;
            address?: string;
        };
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