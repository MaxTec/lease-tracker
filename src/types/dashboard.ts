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