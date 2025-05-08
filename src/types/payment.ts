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
            };
            phone: string;
            emergencyContact?: string;
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

export interface ScheduledPayment {
    id?: string;
    dueDate: Date;
    amount: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    isExisting: boolean;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHECK' | 'OTHER';
    transactionId?: string;
    paidDate?: Date;
} 