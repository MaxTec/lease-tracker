"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import Tabs from "@/components/ui/Tabs";
import PaymentSchedule from "@/components/payments/PaymentSchedule";
import CompletedPayments from "@/components/payments/CompletedPayments";
import { FaPlus, FaHome, FaUser, FaCalendarAlt, FaDollarSign } from "react-icons/fa";

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

export default function LeaseDetailsPage() {
  const { data: session, status: authStatus } = useSession();
  const params = useParams();
  const leaseId = params.id as string;

  const [lease, setLease] = useState<Lease | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not admin
//   if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
//     redirect("/");
//   }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch lease information
        const leaseResponse = await fetch(`/api/leases/${leaseId}`);
        if (!leaseResponse.ok) throw new Error("Failed to fetch lease information");
        const leaseData = await leaseResponse.json();
        setLease(leaseData);
        
        // Fetch payments
        const paymentsResponse = await fetch(`/api/payments?leaseId=${leaseId}`);
        if (!paymentsResponse.ok) throw new Error("Failed to fetch payments");
        const paymentsData = await paymentsResponse.json();
        
        // Ensure we have the full lease information in each payment
        const paymentsWithLease = Array.isArray(paymentsData) ? paymentsData : [paymentsData];
        
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

  const handleRecordPayment = async (paymentId: number) => {
    try {
      // Update the payment status to PAID
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'PAID',
          paidDate: new Date().toISOString(),
          paymentMethod: 'BANK_TRANSFER', // Default payment method
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }

      // Refresh the payments data
      const updatedPayment = await response.json();
      
      // Update the payments state
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId ? { ...payment, ...updatedPayment } : payment
        )
      );
      
      // Show success message
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className='flex items-center justify-center min-h-[200px]'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className='bg-red-50 text-red-600 p-4 rounded-md'>{error}</div>
      </Layout>
    );
  }

  if (!lease) {
    return (
      <Layout>
        <div className='bg-yellow-50 text-yellow-600 p-4 rounded-md'>
          Lease not found
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        {/* Lease Details Card */}
        <div className='bg-white rounded-lg shadow mb-6'>
          <div className='p-6'>
            <div className='flex justify-between items-start mb-6'>
              <h2 className='text-2xl font-semibold text-gray-800'>
                Lease Details
              </h2>
              <div className='flex space-x-2'>
                <Button
                  variant="outline"
                  onClick={() => {/* TODO: Edit lease handler */}}
                >
                  Edit Lease
                </Button>
                <Button
                  variant={lease.status === 'ACTIVE' ? 'danger' : 'success'}
                  onClick={() => {/* TODO: Toggle lease status handler */}}
                >
                  {lease.status === 'ACTIVE' ? 'Terminate Lease' : 'Activate Lease'}
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {/* Property Information */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='text-lg font-medium text-gray-800 mb-3 flex items-center'>
                  <FaHome className='mr-2 text-indigo-600' /> Property
                </h3>
                <div className='space-y-2'>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Name:</span>
                    <p className='text-gray-900'>{lease.unit.property.name}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Address:</span>
                    <p className='text-gray-900'>{lease.unit.property.address}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Unit:</span>
                    <p className='text-gray-900'>{lease.unit.unitNumber}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Details:</span>
                    <p className='text-gray-900'>
                      {lease.unit.bedrooms} bed, {lease.unit.bathrooms} bath, {lease.unit.squareFeet} sq ft
                    </p>
                  </div>
                </div>
              </div>

              {/* Tenant Information */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='text-lg font-medium text-gray-800 mb-3 flex items-center'>
                  <FaUser className='mr-2 text-indigo-600' /> Tenant
                </h3>
                <div className='space-y-2'>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Name:</span>
                    <p className='text-gray-900'>{lease.tenant.user.name}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Email:</span>
                    <p className='text-gray-900'>{lease.tenant.user.email}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Phone:</span>
                    <p className='text-gray-900'>{lease.tenant.phone}</p>
                  </div>
                </div>
              </div>

              {/* Lease Information */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='text-lg font-medium text-gray-800 mb-3 flex items-center'>
                  <FaCalendarAlt className='mr-2 text-indigo-600' /> Lease Terms
                </h3>
                <div className='space-y-2'>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Status:</span>
                    <p className={`font-medium ${
                      lease.status === 'ACTIVE' ? 'text-green-600' : 
                      lease.status === 'EXPIRED' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {lease.status}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Period:</span>
                    <p className='text-gray-900'>
                      {formatDate(lease.startDate)} to {formatDate(lease.endDate)}
                    </p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Monthly Rent:</span>
                    <p className='text-gray-900'>${lease.rentAmount}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Security Deposit:</span>
                    <p className='text-gray-900'>${lease.depositAmount}</p>
                  </div>
                  <div>
                    <span className='text-sm font-medium text-gray-500'>Payment Day:</span>
                    <p className='text-gray-900'>{lease.paymentDay}th of each month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Section */}
        <div className='bg-white rounded-lg shadow'>
          <div className='p-6 border-b border-gray-200'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-xl font-semibold text-gray-800 flex items-center'>
                <FaDollarSign className='mr-2 text-indigo-600' /> Payment Management
              </h3>
              <Button
                onClick={() => {/* TODO: Add new payment handler */}}
              >
                <FaPlus className='mr-2 inline-block align-middle' />
                <span className='align-middle'>Record Payment</span>
              </Button>
            </div>

            <Tabs
              tabs={[
                {
                  id: "upcoming",
                  label: "Upcoming Payments",
                  content: (
                    <PaymentSchedule 
                      payments={payments} 
                      lease={lease}
                      onRecordPayment={handleRecordPayment} 
                    />
                  ),
                },
                {
                  id: "completed",
                  label: "Completed Payments",
                  content: <CompletedPayments payments={payments} lease={lease} />,
                },
              ]}
              defaultTabId='upcoming'
              className='mt-4'
            />
          </div>
        </div>
      </div>
    </Layout>
  );
} 