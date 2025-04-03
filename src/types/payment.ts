export interface Payment {
    id: string;
    amount: number;
    dueDate: string;
    paidDate: string | null;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    paymentMethod: string | null;
    paymentNumber: number;
    lease: {
        id: string;
        rentAmount: number;
        totalPayments: number;
        tenant: {
            user: {
                name: string;
                email: string;
            }
        };
        unit: {
            unitNumber: string;
            property: {
                name: string;
            }
        }
    };
    voucher: {
        id: string;
        voucherNumber: string;
        status: 'GENERATED' | 'SENT' | 'VIEWED';
    } | null;
} 