import { Property as PrismaProperty, Unit, User } from "@prisma/client";

export interface Property extends PrismaProperty {
    units: Pick<Unit, "id" | "unitNumber" | "bedrooms" | "bathrooms">[];
    landlord: {
        user: Pick<User, "name" | "email">;
    };
}

export interface PropertyFormData {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    description?: string;
    landlordId: number;
} 