"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaBuilding } from "react-icons/fa";
import NewLeaseModal from "@/components/admin/NewLeaseModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Lease {
  id: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
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

export default function LeasesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect if not admin
  if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/leases");
        if (!response.ok) throw new Error("Failed to fetch leases");
        const data = await response.json();
        setLeases(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Error fetching leases:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch leases");
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  useEffect(() => {
    const fetchTenants = async () => {
      const response = await fetch("/api/tenants");
      const data = await response.json();
      setTenants(data);
    };

    fetchTenants();
  }, []);

  const handleViewLease = (leaseId: number) => {
    router.push(`/leases/${leaseId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusClass =
      {
        ACTIVE: "bg-green-100 text-green-800",
        EXPIRED: "bg-yellow-100 text-yellow-800",
        TERMINATED: "bg-red-100 text-red-800",
      }[status] || "bg-gray-100 text-gray-800";

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "property",
      label: "Property",
      render: (lease: Lease) =>
        `${lease.unit.property.name} - Unit ${lease.unit.unitNumber}`,
    },
    {
      key: "tenant",
      label: "Tenant",
      render: (lease: Lease) => lease.tenant.user.name,
    },
    {
      key: "rentAmount",
      label: "Monthly Rent",
      render: (lease: Lease) => `$${lease.rentAmount}`,
    },
    {
      key: "period",
      label: "Lease Period",
      render: (lease: Lease) => {
        const startDate = new Date(lease.startDate).toLocaleDateString();
        const endDate = new Date(lease.endDate).toLocaleDateString();
        return `${startDate} - ${endDate}`;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (lease: Lease) => getStatusBadge(lease.status),
    },
    {
      key: "actions",
      label: "Actions",
      render: (lease: Lease) => (
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => handleViewLease(lease.id)}>
            View Details
          </Button>
        </div>
      ),
    },
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLeaseCreated = (newLease: Lease) => {
    setLeases((prevLeases) => [...prevLeases, newLease]);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner size="lg" color="indigo-600" />
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Leases</h2>
              <Button onClick={handleOpenModal}>
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">Add New Lease</span>
              </Button>
            </div>

            {leases.length > 0 ? (
              <Table
                data={leases}
                columns={columns}
                searchable={true}
                searchKeys={[
                  "unit.property.name",
                  "unit.unitNumber",
                  "tenant.user.name",
                  "status",
                ]}
                pageSize={10}
              />
            ) : (
              <EmptyState
                icon={<FaBuilding className="w-12 h-12" />}
                title="No Leases Found"
                description="There are no leases in the system yet. Click the button below to create your first lease."
                actionLabel="Add New Lease"
                onAction={handleOpenModal}
              />
            )}
          </div>
        </div>

        <NewLeaseModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          tenants={tenants}
          onLeaseCreated={handleLeaseCreated}
        />
      </div>
    </Layout>
  );
}
