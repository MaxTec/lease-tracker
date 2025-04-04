import { Landlord as PrismaLandlord, User } from "@prisma/client";

export interface Landlord extends PrismaLandlord {
    user: Pick<User, "name" | "email">;
}

export interface LandlordFormData {
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    companyName?: string;
} 