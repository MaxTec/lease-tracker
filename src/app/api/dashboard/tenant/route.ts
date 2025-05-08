import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { TenantDashboardData } from "@/types/dashboard";
import { Payment } from "@/types/payment";
import { Ticket } from "@/types/ticket";
import { generatePaymentSchedule } from "@/utils/paymentsUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializePayment(payment: any): Payment {
    return {
        id: payment.id.toString(),
        amount: typeof payment.amount === 'object' && payment.amount !== null && 'toNumber' in payment.amount ? payment.amount.toNumber() : Number(payment.amount),
        dueDate: payment.dueDate instanceof Date ? payment.dueDate.toISOString() : payment.dueDate,
        paidDate: payment.paidDate ? (payment.paidDate instanceof Date ? payment.paidDate.toISOString() : payment.paidDate) : null,
        status: payment.status,
        paymentMethod: payment.paymentMethod || null,
        paymentNumber: payment.paymentNumber,
        lease: {
            id: payment.lease.id.toString(),
            rentAmount: typeof payment.lease.rentAmount === 'object' && payment.lease.rentAmount !== null && 'toNumber' in payment.lease.rentAmount ? payment.lease.rentAmount.toNumber() : Number(payment.lease.rentAmount),
            totalPayments: payment.lease.totalPayments,
            tenant: {
                user: {
                    name: payment.lease.tenant.user.name,
                    email: payment.lease.tenant.user.email,
                },
                phone: payment.lease.tenant.phone,
                emergencyContact: payment.lease.tenant.emergencyContact,
            },
            unit: {
                unitNumber: payment.lease.unit.unitNumber,
                property: {
                    name: payment.lease.unit.property.name,
                },
            },
        },
        voucher: payment.voucher
            ? {
                id: payment.voucher.id.toString(),
                voucherNumber: payment.voucher.voucherNumber,
                status: payment.voucher.status,
            }
            : null,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeTicket(ticket: any): Ticket {
    return {
        ...ticket,
        id: ticket.id,
        tenant: ticket.tenant || undefined, // If needed, can be populated
        unit: {
            unitNumber: ticket.unit.unitNumber,
            property: {
                name: ticket.unit.property.name,
            },
        },
    };
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "TENANT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log('session:2', session);

        // Find the tenant by user email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { tenant: true },
        });
        if (!user?.tenant) {
            return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
        }
        const tenantId = user.tenant.id;

        // // Get all leases for this tenant (active or pending)
        const leases = await prisma.lease.findMany({
            where: { tenantId, status: { in: ["ACTIVE", "PENDING"] } },
            include: {
                tenant: { include: { user: { select: { name: true, email: true } } } },
                unit: { include: { property: true } },
                documents: { select: { id: true, type: true, fileUrl: true } },
            },
        });
        const leaseDetails = leases.map(lease => ({
            ...lease,
            tenant: {
                user: {
                    name: lease.tenant.user.name,
                    email: lease.tenant.user.email,
                },
                phone: lease.tenant.phone,
                emergencyContact: lease.tenant.emergencyContact,
            },
            unit: {
                unitNumber: lease.unit.unitNumber,
                property: {
                    name: lease.unit.property.name,
                },
            },
            documents: lease.documents.map(doc => ({
                id: doc.id,
                type: doc.type,
                fileUrl: doc.fileUrl,
            })),
        }));
        const leaseIds = leases.map(l => l.id);
        if (leaseIds.length === 0) {
            return NextResponse.json({ error: "No active leases found" }, { status: 404 });
        }

        // Get all paid payments for these leases
        const paidPaymentsRaw = await prisma.payment.findMany({
            where: { leaseId: { in: leaseIds }, status: "PAID" },
            orderBy: { paidDate: "desc" },
            include: {
                lease: {
                    include: {
                        unit: { include: { property: true } },
                        tenant: { include: { user: { select: { name: true, email: true } } } },
                    },
                },
                voucher: true,
            },
        });
        const paidPayments: Payment[] = paidPaymentsRaw.map(serializePayment);

        // Get next 5 upcoming payments (not paid, due in the future) using generatePaymentSchedule
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const allNextPayments: Payment[] = [];
        for (const lease of leases) {
            // Get all payments for this lease
            const leasePaymentsRaw = await prisma.payment.findMany({
                where: { leaseId: lease.id },
                include: {
                    lease: {
                        include: {
                            unit: { include: { property: true } },
                            tenant: { include: { user: { select: { name: true, email: true } } } },
                        },
                    },
                    voucher: true,
                },
            });
            const leasePayments: Payment[] = leasePaymentsRaw.map(serializePayment);
            // Generate full schedule
            const schedule = generatePaymentSchedule(leasePayments, lease, today);
            console.log("schedule", schedule);
            // Filter for next 5 upcoming (PENDING or OVERDUE, dueDate >= today)
            const next = schedule
                .filter(p => (p.status === "PENDING" || p.status === "OVERDUE") && p.dueDate >= today)
                .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                .slice(0, 5);
            // Map ScheduledPayment to Payment type (fill required fields)
            for (const sched of next) {
                allNextPayments.push({
                    id: sched.id ?? `scheduled-${lease.id}-${sched.dueDate.toISOString()}`,
                    amount: sched.amount,
                    dueDate: sched.dueDate.toISOString(),
                    paidDate: sched.paidDate ? sched.paidDate.toISOString() : null,
                    status: sched.status,
                    paymentMethod: sched.paymentMethod ?? null,
                    paymentNumber: 0, // You may want to calculate the payment number if needed
                    lease: {
                        id: lease.id.toString(),
                        rentAmount: typeof lease.rentAmount === 'object' && lease.rentAmount !== null && 'toNumber' in lease.rentAmount ? lease.rentAmount.toNumber() : Number(lease.rentAmount),
                        totalPayments: lease.totalPayments,
                        tenant: {
                            user: {
                                name: lease.tenant.user.name,
                                email: lease.tenant.user.email,
                            },
                            phone: lease.tenant.phone,
                            emergencyContact: lease.tenant.emergencyContact,
                        },
                        unit: {
                            unitNumber: lease.unit.unitNumber,
                            property: {
                                name: lease.unit.property.name,
                            },
                        },
                    },
                    voucher: null,
                });
            }
        }
        // Sort and take the next 5 overall
        const nextPayments: Payment[] = allNextPayments
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 5);

        // Get tickets for this tenant
        const ticketsRaw = await prisma.ticket.findMany({
            where: { tenantId },
            include: {
                property: true,
                unit: { include: { property: true } },
                comments: {
                    include: {
                        user: { select: { name: true, email: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        const tickets: Ticket[] = ticketsRaw.map(serializeTicket);

        // Get relevant documents for these leases
        const documentsRaw = await prisma.document.findMany({
            where: {
                leaseId: { in: leaseIds },
                type: { in: ["LEASE_AGREEMENT", "ADDENDUM", "INSPECTION_REPORT", "NOTICE", "OTHER"] },
            },
            select: {
                id: true,
                name: true,
                type: true,
                fileUrl: true,
                uploadedAt: true,
            },
            orderBy: { uploadedAt: "desc" },
        });
        const documents = documentsRaw.map(doc => ({
            ...doc,
            uploadedAt: doc.uploadedAt instanceof Date ? doc.uploadedAt.toISOString() : doc.uploadedAt,
        }));

        const data: TenantDashboardData = {
            paidPayments,
            nextPayments,
            tickets,
            documents,
            leases: leaseDetails,
        };
        return NextResponse.json(data);
    } catch (error) {
        console.error("Tenant dashboard error:", error);
        return NextResponse.json({ error: "Failed to fetch tenant dashboard data" }, { status: 500 });
    }
} 