'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Layout from '@/components/layout/Layout';
import EmptyState from '@/components/ui/EmptyState';
import { FaPlus, FaFileInvoiceDollar } from 'react-icons/fa';

interface Payment {
  id: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentMethod: string | null;
  transactionId: string | null;
  lease: {
    tenant: {
      user: {
        name: string;
      };
    };
    unit: {
      unitNumber: string;
      property: {
        name: string;
      };
    };
    rentAmount: number;
  };
  voucher?: {
    voucherNumber: string;
    status: string;
  } | null;
}

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const leaseId = searchParams.get('leaseId');
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not admin
  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    redirect('/');
  }

  // Redirect if no leaseId
  if (!leaseId) {
    redirect('/leases');
  }

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payments?leaseId=${leaseId}`);
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data = await response.json();
        setPayments(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [leaseId]);

  const getStatusBadge = (status: Payment['status']) => {
    const statusMap = {
      PAID: 'success',
      PENDING: 'warning',
      OVERDUE: 'error',
      CANCELLED: 'default'
    } as const;

    return (
      <Badge status={statusMap[status]}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'id',
      label: 'Payment ID',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (payment: Payment) => `$${payment.amount.toFixed(2)}`,
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (payment: Payment) => new Date(payment.dueDate).toLocaleDateString(),
    },
    {
      key: 'paidDate',
      label: 'Paid Date',
      render: (payment: Payment) => 
        payment.paidDate 
          ? new Date(payment.paidDate).toLocaleDateString()
          : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (payment: Payment) => getStatusBadge(payment.status),
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (payment: Payment) => 
        payment.paymentMethod
          ? payment.paymentMethod.replace('_', ' ')
          : '-',
    },
    {
      key: 'voucher',
      label: 'Voucher',
      render: (payment: Payment) => 
        payment.voucher
          ? payment.voucher.voucherNumber
          : '-',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </Layout>
    );
  }

  const leaseInfo = payments[0]?.lease;
  const hasPayments = payments.length > 0;
  console.log(payments);
  console.log(leaseInfo);
  console.log(hasPayments);
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            {leaseInfo && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Payments for Lease
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Property:</span>
                    <p className="text-gray-900">{leaseInfo.unit.property.name} - Unit {leaseInfo.unit.unitNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Tenant:</span>
                    <p className="text-gray-900">{leaseInfo.tenant.user.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Monthly Rent:</span>
                    <p className="text-gray-900">${leaseInfo.rentAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Payment History</h3>
              <Button
                onClick={() => {/* TODO: Add new payment handler */}}
              >
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">Record Payment</span>
              </Button>
            </div>

            {hasPayments ? (
              <Table
                data={payments}
                columns={columns}
                searchable={true}
                searchKeys={['id', 'amount', 'status', 'paymentMethod', 'voucher.voucherNumber']}
                pageSize={10}
              />
            ) : (
              <EmptyState
                icon={<FaFileInvoiceDollar className="w-12 h-12" />}
                title="No Payments Found"
                description="There are no payments recorded for this lease yet. Click the button below to record your first payment."
                actionLabel="Record Payment"
                onAction={() => {/* TODO: Add new payment handler */}}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 