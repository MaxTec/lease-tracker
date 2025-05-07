import { Lease } from "./lease";

export interface DashboardData {
  metrics: {
    totalProperties: number;
    totalUnits: number;
    activeLeases: number;
    totalPayments: number;
    occupancyRate: number;
    totalTickets: number;
  };
  rentCollection: {
    status: string;
    _sum: {
      amount: number;
    };
  }[];
  rentCollectionByMonth: {
    month: string;
    totalAmount: number;
  }[];
  leaseExpirations: {
    endDate: string;
    rentAmount: number;
  }[];
  occupancyBreakdown: {
    status: string;
    _count: number;
  }[];
  ticketsByStatus: {
    status: string;
    _count: number;
  }[];
}

export interface TenantDashboardData {
  paidPayments: import("./payment").Payment[];
  nextPayments: import("./payment").Payment[];
  tickets: import("./ticket").Ticket[];
  documents: Array<{
    id: number;
    name: string;
    type: 'LEASE_AGREEMENT' | 'ADDENDUM' | 'INSPECTION_REPORT' | 'NOTICE' | 'OTHER';
    fileUrl: string;
    uploadedAt: string;
  }>;
  leases: Lease[];
} 