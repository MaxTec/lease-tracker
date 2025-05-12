"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import PaymentSchedule from "@/components/payments/PaymentSchedule";
import CompletedPayments from "@/components/payments/CompletedPayments";
import { FaDollarSign, FaUser, FaCheckCircle, FaPhone, FaEnvelope } from "react-icons/fa";
import Notification from "@/components/ui/Notification";
import Card from "@/components/ui/Card";
import { FORMAT_DATE } from "@/constants";
import { formatDate, getDayOfMonthLabel } from "@/utils/dateUtils";
import { formatPhoneNumber, formatCurrencyMXN } from "@/utils/numberUtils";
import EmptyState from "@/components/ui/EmptyState";
import Descriptions from "@/components/ui/Descriptions";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LeaseActivationForm from "@/components/lease/LeaseActivationForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Lease } from "@/types/lease";
import { Payment, ScheduledPayment } from "@/types/payment";

interface SuccessNotification {
  show: boolean;
  voucherNumber?: string;
  type?: string;
  message?: string;
}

type LeaseItemProps = {
  lease: Lease;
  payments: Payment[];
};

const LeaseItem = ({ lease, payments: initialPayments }: LeaseItemProps) => {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<SuccessNotification>({ show: false });
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);

  const handleRecordPayment = async (payment: ScheduledPayment) => {
    if (!lease) return;
    try {
      setLoading(true);
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: lease.id,
          tenantId: lease.tenantId,
          amount: payment.amount,
          dueDate: payment.dueDate.toISOString(),
          paidDate: payment.paidDate?.toISOString() || null,
          status: "PAID",
          paymentMethod: payment.paymentMethod || "CASH",
        }),
      });
      if (!response.ok) throw new Error("Failed to record payment");
      const newPayment = await response.json();
      setPayments((prevPayments) => [...prevPayments, newPayment]);
      setNotification({ show: true, message: "Payment recorded successfully.", type: "success" });
      setTimeout(() => {
        router.push(`/vouchers/${newPayment.voucher?.voucherNumber}`);
      }, 2000);
    } catch (error) {
      console.error("Error recording payment:", error);
      setNotification({ show: true, message: "Failed to record payment. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateLease = async () => {
    if (!lease) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/leases/${lease.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to terminate lease");
      setNotification({ show: true, message: "Lease terminated successfully.", type: "success" });
      setTimeout(() => {
        router.push("/leases");
      }, 2000);
    } catch (error) {
      console.error("Error terminating lease:", error);
      setNotification({ show: true, message: "Failed to terminate lease. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateLease = () => setIsActivationModalOpen(true);
  const handleActivationSuccess = () => { setIsActivationModalOpen(false); window.location.reload(); };
  const handleActivationCancel = () => setIsActivationModalOpen(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[550px]">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Lease Details Card */}
      <Card
        showShadow={false}
        title=""
        actions={[
          <div className="flex space-x-2" key={lease?.status}>
            {lease?.status !== "ACTIVE" && (
              <Button key="activate-lease" variant="success" onClick={handleActivateLease}>
                Activate Lease
              </Button>
            )}
            {lease?.status === "ACTIVE" && (
              <Button key="terminate-lease" variant="danger" onClick={handleTerminateLease}>
                Terminate Lease
              </Button>
            )}
          </div>,
        ]}
      >
        <div className="grid grid-cols-1 gap-2">
          {/* Property Information */}
          <Descriptions
            title="Property"
            column={5}
            items={[
              { label: "Name", children: lease?.unit.property.name },
              { label: "Address", children: lease?.unit.property.address },
              { label: "Unit", children: lease?.unit.unitNumber },
              { label: "Details", children: `${lease?.unit.bedrooms} bed, ${lease?.unit.bathrooms} bath, ${lease?.unit.squareFeet} sq ft` },
            ]}
          />
          {/* Tenant Information */}
          <Descriptions
            column={5}
            icon={<FaUser />}
            title="Tenant"
            items={[
              { icon: <FaUser />, label: "Name", children: lease?.tenant.user.name },
              {
                label: "Email",
                icon: <FaEnvelope />, children: (
                  <a href={`mailto:${lease?.tenant.user.email || ""}`} className="text-blue-600 hover:text-blue-800 hover:underline" aria-label={`Email ${lease?.tenant.user.name}`}>{lease?.tenant.user.email}</a>
                ),
              },
              {
                label: "Phone",
                icon: <FaPhone />, children: (
                  <a href={`tel:${lease?.tenant.phone || ""}`} className="text-blue-600 hover:text-blue-800 hover:underline" aria-label={`Call ${lease?.tenant.user.name}`}>{formatPhoneNumber(lease?.tenant.phone || "")}</a>
                ),
              },
            ]}
          />
          {/* Lease Terms */}
          <Descriptions
            title="Lease Terms"
            column={5}
            items={[
              {
                label: "Status",
                icon: <FaCheckCircle />, children: (
                  <Badge
                    status={
                      lease?.status === "ACTIVE"
                        ? "success"
                        : lease?.status === "EXPIRED"
                        ? "warning"
                        : "error"
                    }
                  >
                    {lease?.status}
                  </Badge>
                ),
              },
              {
                label: "Period",
                children: `${formatDate(lease?.startDate instanceof Date ? lease?.startDate.toISOString() : lease?.startDate || "", FORMAT_DATE)} to ${formatDate(lease?.endDate instanceof Date ? lease?.endDate.toISOString() : lease?.endDate || "", FORMAT_DATE)}`,
              },
              {
                label: "Monthly Rent",
                children: formatCurrencyMXN(lease?.rentAmount || 0),
              },
              {
                label: "Security Deposit",
                children: formatCurrencyMXN(lease?.depositAmount || 0),
              },
              {
                label: "Payment Day",
                children: getDayOfMonthLabel(lease?.paymentDay || 0),
              },
            ]}
          />
        </div>
      </Card>
      {/* Payments Section */}
      {lease?.status === "ACTIVE" ? (
        <div className="bg-white rounded-lg shadow mt-4">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaDollarSign className="mr-2 text-indigo-600" /> Payment Management
              </h3>
            </div>
            <Tabs
              tabs={[
                {
                  id: "upcoming",
                  label: "Upcoming Payments",
                  content: (
                    <PaymentSchedule
                      payments={payments}
                      lease={lease || undefined}
                      onRecordPayment={handleRecordPayment}
                    />
                  ),
                },
                {
                  id: "completed",
                  label: "Completed Payments",
                  content: (
                    <CompletedPayments
                      payments={payments}
                      lease={lease || undefined}
                    />
                  ),
                },
              ]}
              defaultTabId="upcoming"
              className="mt-4"
            />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <EmptyState
            title="Payment Management is not available for leases that are not active."
            description="Please activate the lease to manage payments."
          />
        </div>
      )}
      {/* Activation Modal */}
      <Modal
        isOpen={isActivationModalOpen}
        onClose={handleActivationCancel}
        title="Activate Lease"
      >
        <LeaseActivationForm
          leaseId={lease.id}
          onSuccess={handleActivationSuccess}
          onCancel={handleActivationCancel}
        />
      </Modal>
      {notification.show && (
        <Notification
          type={notification.type as "success" | "error"}
          title={notification.type === "error" ? "Error" : "Success"}
          message={notification.message as string}
          onClose={() => setNotification({ show: false })}
        />
      )}
    </div>
  );
};

export default LeaseItem; 