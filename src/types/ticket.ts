import { Ticket as PrismaTicket, User, Property } from "@prisma/client";

export interface Ticket extends PrismaTicket {
    tenant: {
        user: Pick<User, "name" | "email">;
    };
    unit: {
        unitNumber: string;
        property: Pick<Property, "name">;
    };
}

export interface TicketFormData {
    title: string;
    description: string;
    priority: string;
    status: string;
    unitId: number;
    category: string;
} 