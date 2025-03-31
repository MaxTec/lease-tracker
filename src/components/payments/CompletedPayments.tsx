import React from "react";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaCheckCircle } from "react-icons/fa";
import { FORMAT_DATE } from "@/constants";
import { format } from "date-fns";
import Link from "next/link";
interface Lease {
  id: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  paymentDay: number;
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
}

interface Payment {
  id: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paymentMethod: string | null;
  transactionId: string | null;
  lease?: Lease;
  voucher?: {
    voucherNumber: string;
    status: string;
  } | null;
}

interface CompletedPaymentsProps {
  payments: Payment[];
  lease?: Lease; // Optional lease prop if provided directly
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
      render: (payment: Payment) => `$${payment.amount.toFixed(2)}`,
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (payment: Payment) =>
        format(new Date(payment.dueDate), FORMAT_DATE),
    },
    {
      key: "paidDate",
      label: "Paid Date",
      render: (payment: Payment) =>
        payment.paidDate
          ? format(new Date(payment.paidDate), FORMAT_DATE)
          : "-",
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      render: (payment: Payment) =>
        payment.paymentMethod ? payment.paymentMethod.replace("_", " ") : "-",
    },
    {
      key: "transactionId",
      label: "Transaction ID",
      render: (payment: Payment) => payment.transactionId || "-",
    },
    {
      key: "voucher",
      label: "Voucher",
      render: (payment: Payment) =>
        payment.voucher ? (
          <Link href={`/vouchers/${payment.voucher.voucherNumber}`}>
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
        actionLabel="Record Payment"
        onAction={() => {
          /* TODO: Add handler */
        }}
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
          "transactionId",
          "voucher.voucherNumber",
        ]}
        pageSize={10}
      />
    </div>
  );
};

export default CompletedPayments;
