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
import { Payment, ScheduledPayment } from '@/types/payment';
import { Lease } from '@/types/lease';
import { useTranslations } from "next-intl";

interface SuccessNotification {
  show: boolean;
  voucherNumber?: string;
  type?: string;
  message?: string;
}

interface ListProps {
  lease: Lease;
  payments: Payment[];
}

const LeaseItem = ({ lease, payments: initialPayments }: ListProps) => {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<SuccessNotification>({ show: false });
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const t = useTranslations();

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
          dueDate: payment.dueDate instanceof Date ? payment.dueDate.toISOString() : payment.dueDate,
          paidDate: payment.paidDate ? (payment.paidDate instanceof Date ? payment.paidDate.toISOString() : payment.paidDate) : null,
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
      console.error(error);
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
      console.error(error);
      setNotification({ show: true, message: "Failed to terminate lease. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateLease = () => setIsActivationModalOpen(true);
  const handleActivationSuccess = () => {
    setIsActivationModalOpen(false);
    window.location.reload();
  };
  const handleActivationCancel = () => setIsActivationModalOpen(false);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[550px]'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Lease Details Card */}
      <Card
        showShadow={false}
        title=''
        actions={[
          <div className='flex space-x-2' key={lease?.status}>
            {lease?.status !== "ACTIVE" && (
              <Button key='activate-lease' variant='success' onClick={handleActivateLease}>
                {t('leases.details.activateLease')}
              </Button>
            )}
            {lease?.status === "ACTIVE" && (
              <Button key='terminate-lease' variant='danger' onClick={handleTerminateLease}>
                {t('leases.details.terminateLease')}
              </Button>
            )}
          </div>,
        ]}
      >
        <div className='grid grid-cols-1 gap-2'>
          {/* Property Information */}
          <Descriptions
            title={t('leases.details.property')}
            column={5}
            items={[
              { label: t('leases.details.propertyName'), children: lease?.unit.property.name },
              { label: t('leases.details.propertyAddress'), children: lease?.unit.property.address },
              { label: t('leases.details.unit'), children: lease?.unit.unitNumber },
              { label: t('leases.details.unitDetails'), children: `${lease?.unit.bedrooms} ${t('leases.details.bed')}, ${lease?.unit.bathrooms} ${t('leases.details.bath')}, ${lease?.unit.squareFeet} ${t('leases.details.sqft')}` },
            ]}
          />
          {/* Tenant Information */}
          <Descriptions
            column={5}
            icon={<FaUser />}
            title={t('leases.details.tenant')}
            items={[
              { icon: <FaUser />, label: t('leases.details.tenantName'), children: lease?.tenant.user.name },
              {
                label: t('leases.details.tenantEmail'),
                icon: <FaEnvelope />, children: (
                  <a
                    href={`mailto:${lease?.tenant.user.email || ""}`}
                    className='text-blue-600 hover:text-blue-800 hover:underline'
                    aria-label={t('leases.details.emailAria', { name: lease?.tenant.user.name })}
                  >
                    {lease?.tenant.user.email}
                  </a>
                ),
              },
              {
                label: t('leases.details.tenantPhone'),
                icon: <FaPhone />, children: (
                  <a href={`tel:${lease?.tenant.phone || ""}`} className='text-blue-600 hover:text-blue-800 hover:underline' aria-label={t('leases.details.phoneAria', { name: lease?.tenant.user.name })}>
                    {formatPhoneNumber(lease?.tenant.phone || "")}
                  </a>
                ),
              },
            ]}
          />
          {/* Lease Terms */}
          <Descriptions
            title={t('leases.details.leaseTerms')}
            column={5}
            items={[
              {
                label: t('leases.details.status'),
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
                    {t(`common.status.${lease?.status?.toLowerCase()}`)}
                  </Badge>
                ),
              },
              {
                label: t('leases.details.period'),
                children: `${formatDate(lease?.startDate instanceof Date ? lease?.startDate.toISOString() : lease?.startDate || "", FORMAT_DATE)} ${t('leases.details.to')} ${formatDate(lease?.endDate instanceof Date ? lease?.endDate.toISOString() : lease?.endDate || "", FORMAT_DATE)}`,
              },
              {
                label: t('leases.details.monthlyRent'),
                children: formatCurrencyMXN(lease?.rentAmount || 0),
              },
              {
                label: t('leases.details.securityDeposit'),
                children: formatCurrencyMXN(lease?.depositAmount || 0),
              },
              {
                label: t('leases.details.paymentDay'),
                children: getDayOfMonthLabel(lease?.paymentDay || 0),
              },
            ]}
          />
        </div>
      </Card>
      {/* Payments Section */}
      {lease?.status === "ACTIVE" ? (
        <div className='bg-white rounded-lg shadow mt-4'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-xl font-semibold text-gray-800 flex items-center'>
                <FaDollarSign className='mr-2 text-indigo-600' /> {t('leases.details.paymentManagement')}
              </h3>
            </div>
            <Tabs
              tabs={[
                {
                  id: "upcoming",
                  label: t('leases.details.upcomingPayments'),
                  content: <PaymentSchedule payments={payments} lease={lease || undefined} onRecordPayment={handleRecordPayment} />,
                },
                {
                  id: "completed",
                  label: t('leases.details.completedPayments'),
                  content: <CompletedPayments payments={payments} lease={lease || undefined} />,
                },
              ]}
              defaultTabId='upcoming'
              className='mt-4'
            />
          </div>
        </div>
      ) : (
        <div className='bg-gray-50 p-4 rounded-lg mt-4'>
          <EmptyState
            title={t('leases.details.paymentManagementUnavailable')}
            description={t('leases.details.activateToManagePayments')}
          />
        </div>
      )}
      {/* Activation Modal */}
      <Modal isOpen={isActivationModalOpen} onClose={handleActivationCancel} title={t('leases.details.activateLease')}>
        <LeaseActivationForm leaseId={lease.id} onSuccess={handleActivationSuccess} onCancel={handleActivationCancel} />
      </Modal>
      {notification.show && (
        <Notification
          type={notification.type as "success" | "error"}
          title={notification.type === "error" ? t('common.error') : t('common.success')}
          message={notification.message as string}
          onClose={() => setNotification({ show: false })}
        />
      )}
    </div>
  );
};

export default LeaseItem;
