'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Payment } from '@/types/payment';
import PaymentModal from './PaymentModal';

export default function AdminPaymentList() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setError('Error loading payments. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (data: Partial<Payment>) => {
    try {
      const url = selectedPayment
        ? `/api/admin/payments/${selectedPayment.id}`
        : '/api/admin/payments';
      
      const response = await fetch(url, {
        method: selectedPayment ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(selectedPayment ? 'Failed to update payment' : 'Failed to create payment');
      }

      await fetchPayments();
      setIsModalOpen(false);
      setSelectedPayment(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save payment. Please try again.');
    }
  };

  const sendVoucher = async (voucherId: string) => {
    try {
      const response = await fetch('/api/admin/vouchers/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voucherId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send voucher');
      }

      await fetchPayments();
      alert('Voucher sent successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to send voucher. Please try again.');
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: Payment['status']) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      await fetchPayments();
    } catch (err) {
      console.error(err);
      alert('Failed to update payment status. Please try again.');
    }
  };

  const sendReminder = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/remind`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }

      alert('Payment reminder sent successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to send reminder. Please try again.');
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
                <select
                  value={payment.status}
                  onChange={(e) => updatePaymentStatus(payment.id, e.target.value as Payment['status'])}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
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
                  <span className="text-gray-500">No voucher</span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  {payment.status === 'PAID' && payment.voucher?.status === 'GENERATED' && (
                    <button
                      onClick={() => sendVoucher(payment.voucher!.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Send Voucher
                    </button>
                  )}
                  {(payment.status === 'PENDING' || payment.status === 'OVERDUE') && (
                    <button
                      onClick={() => sendReminder(payment.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Send Reminder
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsModalOpen(true);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Payment Button */}
      <div className="mt-6">
        <button
          onClick={() => {
            setSelectedPayment(null);
            setIsModalOpen(true);
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Payment
        </button>
      </div>

      <PaymentModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        onSubmit={handlePaymentSubmit}
      />
    </div>
  );
} 