"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import NewPaymentModal from "./admin/NewPaymentModal";
import Button from './ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { FaMoneyBillWave } from 'react-icons/fa';

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paymentMethod: string | null;
  lease: {
    id: string;
    rentAmount: number;
    tenant: {
      user: {
        name: string;
        email: string;
      };
    };
    unit: {
      unitNumber: string;
      property: {
        name: string;
      };
    };
  };
  voucher: {
    id: string;
    voucherNumber: string;
    status: "GENERATED" | "SENT" | "VIEWED";
  } | null;
}

export default function PaymentList() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPayments = async () => {
    console.log("Fetching payments");
    try {
      const response = await fetch("/api/payments");
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      setError("Error loading payments. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const sendVoucher = async (voucherId: string) => {
    try {
      const response = await fetch("/api/vouchers/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucherId }),
      });

      if (!response.ok) {
        throw new Error("Failed to send voucher");
      }

      // Refresh the payments list
      await fetchPayments();

      alert("Voucher sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send voucher. Please try again.");
    }
  };

  const sendBulkEmail = async () => {
    try {
      const response = await fetch('/api/payments/send-bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send bulk email');
      }
      
      alert('Bulk email sent successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to send bulk email. Please try again.');
    }
  };

  const handleModalSuccess = () => {
    // Refresh the payments list after successful creation
    fetchPayments();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading payments...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  if (payments.length === 0) {
    return (
        <EmptyState
            icon={<FaMoneyBillWave className="w-12 h-12" />}
            title="No Payments Found"
            description="There are no payments available at this time."
            actionLabel="Add Payment"
            onAction={() => setIsModalOpen(true)}
        />
    );
  }

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div>
      {isAdmin && (
        <div className="mb-6 flex justify-end gap-4">
          <Button 
            onClick={sendBulkEmail}
            variant="primary"
          >
            Send Email to All
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="success"
          >
            Add Payment
          </Button>
        </div>
      )}
      <NewPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
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
              <tr
                key={payment.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 px-4">{payment.lease.tenant.user.name}</td>
                <td className="py-3 px-4">
                  {payment.lease.unit.property.name} - Unit{" "}
                  {payment.lease.unit.unitNumber}
                </td>
                <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
                <td className="py-3 px-4">
                  {new Date(payment.dueDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : payment.status === "OVERDUE"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
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
                      {payment.voucher.status === "SENT" && " (Sent)"}
                      {payment.voucher.status === "VIEWED" && " (Viewed)"}
                    </Link>
                  ) : (
                    payment.status === "PAID" && (
                      <span className="text-gray-500">No voucher</span>
                    )
                  )}
                </td>
                <td className="py-3 px-4">
                  {payment.status === "PAID" &&
                    payment.voucher &&
                    payment.voucher.status === "GENERATED" && (
                      <Button
                        onClick={() => sendVoucher(payment.voucher!.id)}
                        variant="primary"
                        size="sm"
                      >
                        Send Voucher
                      </Button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
