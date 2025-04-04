import { Tenant as PrismaTenant, User, Lease } from "@prisma/client";

export interface Tenant extends PrismaTenant {
    user: Pick<User, "name" | "email">;
    leases: Pick<Lease, "id" | "startDate" | "endDate" | "status">[];
}

export interface TenantFormData {
    name: string;
    email: string;
    password?: string;
    phone: string;
    emergencyContact: string;
    emergencyPhone: string;
    employmentInfo?: string;
} 