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
import { useTranslations } from "next-intl";

export default function LeasesPage() {
  const t = useTranslations();
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
        if (!response.ok) throw new Error(t("leases.errors.fetchFailed"));
        const data = await response.json();
        console.log("data", data);
        setLeases(Array.isArray(data) ? data : [data]);
      } catch (err) {
        console.error("Error fetching leases:", err);
        setError(err instanceof Error ? err.message : t("leases.errors.fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, [t]);

  const handleViewLease = (leaseId: number) => {
    router.push(`/leases/${leaseId}`);
  };

  const columns = [
    {
      key: "property",
      label: t("leases.list.property"),
      render: (lease: Lease) =>
        `${lease.unit.property.name} - ${t("leases.list.unit")} ${lease.unit.unitNumber}`,
    },
    {
      key: "tenant",
      label: t("leases.list.tenant"),
      render: (lease: Lease) => lease.tenant.user.name,
    },
    {
      key: "rentAmount",
      label: t("leases.list.monthlyRent"),
      render: (lease: Lease) => `$${lease.rentAmount}`,
    },
    {
      key: "period",
      label: t("leases.list.leasePeriod"),
      render: (lease: Lease) => {
        const startDate = formatDate(lease.startDate, FORMAT_DATE);
        const endDate = formatDate(lease.endDate, FORMAT_DATE);
        return `${startDate} - ${endDate}`;
      },
    },
    {
      key: "status",
      label: t("leases.list.status"),
      render: (lease: Lease) => {
        const status = lease.status;
        return <Badge status={getBadgeStatus(status)}>{t(`common.status.${status.toLowerCase()}`)}</Badge>;
      },
    },
    {
      key: "document",
      label: t("leases.list.leaseAgreement"),
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
          <span className="text-gray-400 text-sm">{t("leases.list.noDocument")}</span>
        );
      },
    },
    {
      key: "actions",
      label: t("leases.list.actions"),
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
              <h2 className="text-2xl font-semibold text-gray-800">{t("leases.title")}</h2>
              <Button onClick={handleAddNewLease}>
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">{t("leases.create")}</span>
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
                title={t("leases.emptyState.title")}
                description={t("leases.emptyState.description")}
                actionLabel={t("leases.create")}
                onAction={handleAddNewLease}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
