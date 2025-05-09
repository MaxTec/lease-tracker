import { Ticket as PrismaTicket, User, Property } from "@prisma/client";

export interface TicketImage {
    url: string;
    altText?: string;
}

export interface Ticket extends PrismaTicket {
    tenant: {
        user: Pick<User, "name" | "email">;
    };
    unit: {
        unitNumber: string;
        property: Pick<Property, "name">;
    };
    images: TicketImage[];
}

export interface TicketFormData {
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    images: TicketImage[];
} 