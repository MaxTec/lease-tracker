'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentMethod: string | null;
  lease: {
    id: string;
    rentAmount: number;
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

export default function PaymentList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payments');
        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }
        const data = await response.json();
        console.log(data);
        setPayments(data);
      } catch (err) {
        setError('Error loading payments. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const sendVoucher = async (voucherId: string) => {
    try {
      const response = await fetch('/api/vouchers/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voucherId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send voucher');
      }

      // Refresh the payments list
      const updatedPayments = await fetch('/api/payments').then(res => res.json());
      setPayments(updatedPayments);
      
      alert('Voucher sent successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to send voucher. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading payments...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  if (payments.length === 0) {
    return <div className="p-8">No payments found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Tenant</th>
            <th className="py-3 px-4 text-left">Property</th>
            <th className="py-3 px-4 text-left">Amount</th>
            <th className="py-3 px-4 text-left">Due Date</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Voucher</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">{payment.lease.tenant.user.name}</td>
              <td className="py-3 px-4">
                {payment.lease.unit.property.name} - Unit {payment.lease.unit.unitNumber}
              </td>
              <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
              <td className="py-3 px-4">{new Date(payment.dueDate).toLocaleDateString()}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : payment.status === 'OVERDUE'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {payment.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {payment.voucher ? (
                  <Link
                    href={`/vouchers/${payment.voucher.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {payment.voucher.voucherNumber}
                    {payment.voucher.status === 'SENT' && ' (Sent)'}
                    {payment.voucher.status === 'VIEWED' && ' (Viewed)'}
                  </Link>
                ) : (
                  payment.status === 'PAID' && <span className="text-gray-500">No voucher</span>
                )}
              </td>
              <td className="py-3 px-4">
                {payment.status === 'PAID' && payment.voucher && payment.voucher.status === 'GENERATED' && (
                  <button
                    onClick={() => sendVoucher(payment.voucher!.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Send Voucher
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 