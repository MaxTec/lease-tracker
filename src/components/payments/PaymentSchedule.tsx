import React, { useState } from "react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { FaCalendarAlt } from "react-icons/fa";
import { differenceInDays } from "date-fns";
import Button from "@/components/ui/Button";
import { formatDate } from "@/utils/dateUtils";
import { FORMAT_DATE } from "@/constants";
import { PaymentForm } from "./PaymentForm";
import Modal from "@/components/ui/Modal";

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
}

interface PaymentScheduleProps {
  payments: Payment[];
  lease?: Lease; // Optional lease prop if provided directly
  onRecordPayment: (payment: ScheduledPayment) => void;
}

interface ScheduledPayment {
  id?: number;
  dueDate: Date;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  isExisting: boolean;
  paymentMethod?: "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "CHECK" | "OTHER";
  transactionId?: string;
  paidDate?: Date;
}

const PaymentSchedule: React.FC<PaymentScheduleProps> = ({
  payments,
  lease,
  onRecordPayment,
}) => {
  const [selectedPayment, setSelectedPayment] =
    useState<ScheduledPayment | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Get current date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the last payment date
  const lastPaymentDate = payments
    .filter((p) => p.status === "PAID")
    .sort(
      (a, b) =>
        new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime()
    )[0]?.paidDate;

  // Get lease information from the lease prop or from the first payment
  const leaseInfo =
    lease ||
    (payments.length > 0 && payments[0].lease ? payments[0].lease : null);

  if (!leaseInfo) {
    return (
      <EmptyState
        icon={<FaCalendarAlt className="w-12 h-12" />}
        title="No Lease Information"
        description="Cannot generate payment schedule without lease information."
        actionLabel="Go to Leases"
        onAction={() => {
          /* TODO: Add handler */
        }}
      />
    );
  }

  // Generate all scheduled payments based on lease dates
  const generatePaymentSchedule = (): ScheduledPayment[] => {
    const startDate = new Date(
      Date.UTC(
        new Date(leaseInfo.startDate).getUTCFullYear(),
        new Date(leaseInfo.startDate).getUTCMonth(),
        new Date(leaseInfo.startDate).getUTCDate()
      )
    );
    const endDate = new Date(
      Date.UTC(
        new Date(leaseInfo.endDate).getUTCFullYear(),
        new Date(leaseInfo.endDate).getUTCMonth(),
        new Date(leaseInfo.endDate).getUTCDate()
      )
    );
    const paymentDay = leaseInfo.paymentDay;
    const rentAmount = leaseInfo.rentAmount;

    // Map existing payments by due date for quick lookup
    const existingPaymentsByDate = new Map<string, Payment>();
    payments.forEach((payment) => {
      const dueDate = new Date(payment.dueDate);
      const dateKey = `${dueDate.getUTCFullYear()}-${dueDate.getUTCMonth()}-${dueDate.getUTCDate()}`;
      existingPaymentsByDate.set(dateKey, payment);
    });

    const scheduledPayments: ScheduledPayment[] = [];

    // Start from the lease start date
    const currentDate = new Date(startDate);

    // If payment day is specified, set the day of the first month
    if (paymentDay) {
      currentDate.setUTCDate(paymentDay);

      // If the payment day is before the start date, move to the next month
      if (currentDate < startDate) {
        currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
      }
    }

    // Generate payments until the end date
    while (currentDate <= endDate) {
      const dateKey = `${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth()}-${currentDate.getUTCDate()}`;
      const existingPayment = existingPaymentsByDate.get(dateKey);

      if (existingPayment) {
        // Use existing payment data
        scheduledPayments.push({
          id: existingPayment.id,
          dueDate: new Date(existingPayment.dueDate),
          amount: Number(existingPayment.amount),
          status: existingPayment.status,
          isExisting: true,
        });
      } else {
        // Create a new scheduled payment
        const status = currentDate < today ? "OVERDUE" : "PENDING";
        scheduledPayments.push({
          dueDate: new Date(currentDate),
          amount: Number(rentAmount),
          status,
          isExisting: false,
        });
      }

      // Move to the next month
      currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
    }

    return scheduledPayments;
  };

  const allScheduledPayments = generatePaymentSchedule();

  // Sort by due date
  const sortedScheduledPayments = [...allScheduledPayments].sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
  );

  // Past due payments
  const pastDuePayments = sortedScheduledPayments.filter(
    (p) => p.dueDate < today && p.status !== "PAID"
  );

  // Next payment (closest due date that's not past and not paid)
  const nextPayment = sortedScheduledPayments.find(
    (p) => p.dueDate >= today && p.status !== "PAID"
  );

  // Future payments (next 3 months, excluding the next payment)
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  const futurePayments = sortedScheduledPayments
    .filter((p) => {
      return (
        p.dueDate > today &&
        p.dueDate <= threeMonthsFromNow &&
        p.status !== "PAID" &&
        p !== nextPayment
      );
    })
    .slice(0, 3); // Limit to 3 payments

  // Identify the oldest unpaid payment across all categories
  const oldestUnpaidPayment = sortedScheduledPayments.find(
    (p) => !p.isExisting && p.status !== "PAID"
  );

  const getStatusBadge = (status: Payment["status"]) => {
    const statusMap = {
      PAID: "success",
      PENDING: "warning",
      OVERDUE: "error",
      CANCELLED: "default",
    } as const;

    return (
      <Badge status={statusMap[status]}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const PaymentCard = ({
    payment,
    label,
  }: {
    payment: ScheduledPayment;
    label?: string;
  }) => {
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    const dayDiff = differenceInDays(today, dueDate);
    const humanReadableDate = dayDiff > 0 ? `(${dayDiff} days late)` : "";
    console.log("dueDate", formatDate(dueDate, FORMAT_DATE, "UTC"));
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        {label && (
          <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-semibold">
              ${payment.amount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              Due: {formatDate(payment.dueDate, FORMAT_DATE, "UTC")}{" "}
              {humanReadableDate}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(payment.status)}
            {!payment.isExisting && payment === oldestUnpaidPayment ? (
              <Button
                onClick={() => {
                  setSelectedPayment(payment);
                  setIsConfirmOpen(true);
                }}
                variant="secondary"
                size="sm"
                className="ml-2"
              >
                Track Payment
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  if (allScheduledPayments.length === 0) {
    return (
      <EmptyState
        icon={<FaCalendarAlt className="w-12 h-12" />}
        title="No Upcoming Payments"
        description="There are no upcoming payments scheduled for this lease."
        actionLabel="Create Payment Schedule"
        onAction={() => {
          /* TODO: Add handler */
        }}
      />
    );
  }
  return (
    <div className="space-y-6">
      {/* Past Due Section */}
      {pastDuePayments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-red-600 mb-3">Past Due</h3>
          <div className="space-y-3">
            {pastDuePayments.map((payment, index) => (
              <PaymentCard
                key={payment.id || `past-due-${index}`}
                payment={payment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Next Payment Section */}
      {nextPayment && (
        <div>
          <h3 className="text-lg font-medium text-indigo-600 mb-3">
            Next Payment
          </h3>
          <PaymentCard payment={nextPayment} />
        </div>
      )}

      {/* Upcoming Payments Section */}
      {futurePayments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Upcoming Payments
          </h3>
          <div className="space-y-3">
            {futurePayments.map((payment, index) => (
              <PaymentCard
                key={payment.id || `future-${index}`}
                payment={payment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Payment Confirmation Dialog */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Payment"
      >
        <PaymentForm
          onClose={() => setIsConfirmOpen(false)}
          onSubmit={(data) => {
            if (selectedPayment) {
            onRecordPayment({
              ...selectedPayment,
              paymentMethod: data.paymentMethod,
              transactionId: data.transactionId,
              paidDate: new Date(data.paymentDate),
            });
            setIsConfirmOpen(false);
            setSelectedPayment(null);
          }
        }}
        leaseStartDate={leaseInfo.startDate}
        lastPaymentDate={lastPaymentDate}
        initialData={{
          paymentMethod: "CASH",
          paymentDate: new Date().toISOString().split("T")[0],
            transactionId: "",
          }}
        />
      </Modal>
    </div>
  );
};

export default PaymentSchedule;
