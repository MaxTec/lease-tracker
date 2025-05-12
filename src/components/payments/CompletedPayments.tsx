import React from "react";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaCheckCircle } from "react-icons/fa";
import { FORMAT_DATE } from "@/constants";
import { formatDate } from "@/utils/dateUtils";
import Link from "next/link";
import { formatCurrencyMXN } from "@/utils/numberUtils";
import { Payment } from '@/types/payment';
import { Lease } from '@/types/lease';

interface CompletedPaymentsProps {
  payments: Payment[];
  lease?: Lease;
}

const CompletedPayments: React.FC<CompletedPaymentsProps> = ({ payments }) => {
  // Filter only paid payments
  const paidPayments = payments.filter((p) => p.status === "PAID");

  // Sort by paid date (most recent first)
  const sortedPayments = [...paidPayments].sort((a, b) => {
    if (!a.paidDate || !b.paidDate) return 0;
    return new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime();
  });

  const columns = [
    {
      key: "id",
      label: "Payment ID",
    },
    {
      key: "amount",
      label: "Amount",
      render: (payment: Payment) => formatCurrencyMXN(payment.amount),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (payment: Payment) =>
        formatDate(payment.dueDate, FORMAT_DATE),
    },
    {
      key: "paidDate",
      label: "Paid Date",
      render: (payment: Payment) =>
        payment.paidDate
          ? formatDate(payment.paidDate, FORMAT_DATE)
          : "-",
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      render: (payment: Payment) =>
        payment.paymentMethod ? payment.paymentMethod.replace("_", " ") : "-",
    },
    {
      key: "voucher",
      label: "Voucher",
      render: (payment: Payment) =>
        payment.voucher ? (
          <Link
            href={`/vouchers/${payment.voucher.voucherNumber}`}
            className="text-indigo-600 hover:underline"
            aria-label={`View voucher number ${payment.voucher.voucherNumber}`}
            tabIndex={0}
            onClick={() => {}}
            onKeyDown={(e) => e.key === 'Enter' && {}}
          >
            {payment.voucher.voucherNumber}
          </Link>
        ) : (
          "-"
        ),
    },
  ];

  if (paidPayments.length === 0) {
    return (
      <EmptyState
        icon={<FaCheckCircle className="w-12 h-12" />}
        title="No Completed Payments"
        description="There are no completed payments for this lease yet."
      />
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        Payment History
      </h3>
      <Table
        data={sortedPayments}
        columns={columns}
        searchable={true}
        searchKeys={[
          "id",
          "amount",
          "paymentMethod",
          "voucher.voucherNumber",
        ]}
        pageSize={10}
      />
    </div>
  );
};

export default CompletedPayments;
