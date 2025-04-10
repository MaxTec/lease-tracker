"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaBuilding } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/utils/dateUtils";
import { FORMAT_DATE } from "@/constants";
import Badge from "@/components/ui/Badge";
import { FaEye, FaFilePdf } from "react-icons/fa";
import { Lease } from "@/types/lease";

export default function LeasesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        console.log("data", data);
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

  const handleViewLease = (leaseId: number) => {
    router.push(`/leases/${leaseId}`);
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
        const startDate = formatDate(lease.startDate, FORMAT_DATE);
        const endDate = formatDate(lease.endDate, FORMAT_DATE);
        return `${startDate} - ${endDate}`;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (lease: Lease) => {
        const status = lease.status;
        return <Badge status={getBadgeStatus(status)}>{status}</Badge>;
      },
    },
    {
      key: "document",
      label: "Lease Agreement",
      render: (lease: Lease) => {
        const hasDocument = lease.documents?.some(
          (doc) => doc.type === "LEASE_AGREEMENT"
        );
        console.log("hasDocument", hasDocument);
        return hasDocument ? (
          <Button
            variant="outline"
            size="md"
            square
            onClick={() => router.push(`/leases/${lease.id}/document`)}
          >
            <FaFilePdf />
          </Button>
        ) : (
          <span className="text-gray-400 text-sm">No document</span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (lease: Lease) => (
        <div className="flex space-x-2">
          <Button square size="md" onClick={() => handleViewLease(lease.id)}>
            <FaEye />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddNewLease = () => {
    router.push("/leases/new");
  };

  const getBadgeStatus = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "EXPIRED":
        return "error";
      case "TERMINATED":
        return "warning";
      default:
        return "default";
    }
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
              {leases.length > 0 && (
                <Button onClick={handleAddNewLease}>
                  <FaPlus className="mr-2 inline-block align-middle" />
                  <span className="align-middle">Add New Lease</span>
                </Button>
              )}
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
                onAction={handleAddNewLease}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
