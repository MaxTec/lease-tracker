"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import Tabs from "@/components/ui/Tabs";
import PaymentSchedule from "@/components/payments/PaymentSchedule";
import CompletedPayments from "@/components/payments/CompletedPayments";
import { FaDollarSign } from "react-icons/fa";
import Notification from "@/components/ui/Notification";
import Card from "@/components/ui/Card";
import { FORMAT_DATE } from "@/constants";
import { formatDate } from "@/utils/dateUtils";
import EmptyState from "@/components/ui/EmptyState";
import Descriptions from "@/components/ui/Descriptions";
import Badge from "@/components/ui/Badge";

interface Lease {
  id: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  paymentDay: number;
  depositAmount: number;
  status: string;
  tenant: {
    id: number;
    user: {
      name: string;
      email: string;
    };
    phone: string;
  };
  unit: {
    id: number;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    property: {
      id: number;
      name: string;
      address: string;
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
  lease: Lease;
  voucher?: {
    voucherNumber: string;
    status: string;
  } | null;
}

interface ScheduledPayment {
  id?: number;
  dueDate: Date;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  isExisting: boolean;
  paymentMethod?: "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "CHECK" | "OTHER";
  transactionId?: string;
}

interface SuccessNotification {
  show: boolean;
  voucherNumber?: string;
  type?: string;
  message?: string;
}

export default function LeaseDetailsPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const params = useParams();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<Lease | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<SuccessNotification>({
    show: false,
  });

  // Redirect if not admin
  if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/");
  }
  // redirect if lease is not found
  // if (!lease) {
  //   redirect("/leases");
  // }
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch lease information
        const leaseResponse = await fetch(`/api/leases/${leaseId}`);
        if (!leaseResponse.ok)
          throw new Error("Failed to fetch lease information");
        const leaseData = await leaseResponse.json();
        setLease(leaseData);

        // Fetch payments
        const paymentsResponse = await fetch(
          `/api/payments?leaseId=${leaseId}`
        );
        if (!paymentsResponse.ok) throw new Error("Failed to fetch payments");
        const paymentsData = await paymentsResponse.json();

        // Ensure we have the full lease information in each payment
        const paymentsWithLease = Array.isArray(paymentsData)
          ? paymentsData
          : [paymentsData];

        // Add lease information to each payment if not already present
        paymentsWithLease.forEach((payment) => {
          if (!payment.lease) {
            payment.lease = leaseData;
          }
        });

        setPayments(paymentsWithLease);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    if (leaseId) {
      fetchData();
    }
  }, [leaseId]);

  const handleRecordPayment = async (payment: ScheduledPayment) => {
    if (!lease) return;

    try {
      // Create a new payment record
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaseId: lease.id,
          tenantId: lease.tenant.id,
          amount: payment.amount,
          dueDate: payment.dueDate.toISOString(),
          paidDate: new Date().toISOString(),
          status: "PAID",
          paymentMethod: payment.paymentMethod || "CASH",
          transactionId: payment.transactionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record payment");
      }

      // Refresh the payments data
      const newPayment = await response.json();

      // Update the payments state
      setPayments((prevPayments) => [...prevPayments, newPayment]);
      console.log(newPayment);

      // Show success notification with voucher link
      setNotification({
        show: true,
        voucherNumber: newPayment.voucher?.voucherNumber,
      });

      // Hide notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false });
      }, 5000);
    } catch (error) {
      console.error("Error recording payment:", error);
      setNotification({
        show: true,
        message: "Failed to record payment. Please try again.",
        type: "error",
      });
    }
  };

  const handleTerminateLease = async () => {
    if (!lease) return;

    try {
      const response = await fetch(`/api/leases/${lease.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to terminate lease");
      }

      // Show success notification
      setNotification({
        show: true,
        message: "Lease terminated successfully.",
        type: "success",
      });
      setTimeout(() => {
        // Optionally, you can refresh the lease data or redirect
        router.push("/leases"); // Redirect to the leases list or another page
      }, 2000); // Delay of 1 second before showing the notification
    } catch (error) {
      console.error("Error terminating lease:", error);
      setNotification({
        show: true,
        message: "Failed to terminate lease. Please try again.",
        type: "error",
      });
    }
  };

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
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Lease Details Card */}
        <Card
          title="Details"
          actions={[
            <Button
              key={lease?.status}
              variant={lease?.status === "ACTIVE" ? "danger" : "success"}
              onClick={handleTerminateLease}
            >
              {lease?.status === "ACTIVE"
                ? "Terminate Lease"
                : "Activate Lease"}
            </Button>,
          ]}
        >
          <div className="grid grid-cols-1 gap-2">
            {/* Property Information */}
            <Descriptions
              title="Property"
              column={5}
              items={[
                {
                  label: "Name",
                  children: lease?.unit.property.name,
                },
                {
                  label: "Address",
                  children: lease?.unit.property.address,
                },
                {
                  label: "Unit",
                  children: lease?.unit.unitNumber,
                },
                {
                  label: "Details",
                  children: `${lease?.unit.bedrooms} bed, ${lease?.unit.bathrooms} bath, ${lease?.unit.squareFeet} sq ft`,
                },
              ]}
            />

            {/* Tenant Information */}
            <Descriptions
              column={5}
              title="Tenant"
              items={[
                {
                  label: "Name",
                  children: lease?.tenant.user.name,
                },
                {
                  label: "Email",
                  children: lease?.tenant.user.email,
                },
                {
                  label: "Phone",
                  children: lease?.tenant.phone,
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
                  children: (
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
                  children: `${formatDate(
                    lease?.startDate || "",
                    FORMAT_DATE
                  )} to ${formatDate(lease?.endDate || "", FORMAT_DATE)}`,
                },
                {
                  label: "Monthly Rent",
                  children: `$${lease?.rentAmount}`,
                },
                {
                  label: "Security Deposit",
                  children: `$${lease?.depositAmount}`,
                },
                {
                  label: "Payment Day",
                  children: `${formatDate(
                    new Date(lease?.paymentDay || ""),
                    "do"
                  )} of each month`,
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
                  <FaDollarSign className="mr-2 text-indigo-600" /> Payment
                  Management
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

        {notification.show && (
          <Notification
            type={notification.type as "success" | "error"}
            title={notification.type === "error" ? "Error" : "Success"}
            message={notification.message as string}
            action={
              notification.voucherNumber
                ? {
                    label: "View Voucher",
                    onClick: () =>
                      notification.voucherNumber &&
                      router.push(
                        `/vouchers/${encodeURIComponent(
                          notification.voucherNumber
                        )}`
                      ),
                  }
                : undefined
            }
            onClose={() => setNotification({ show: false })}
          />
        )}
      </div>
    </Layout>
  );
}
