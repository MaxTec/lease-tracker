"use client";

import { useState, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaBuilding, FaEye, FaFilePdf } from "react-icons/fa";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { Lease } from "@/types/lease";
import { useTranslations } from "next-intl";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/dateUtils";
import { FORMAT_DATE } from "@/constants";
import { formatCurrencyMXN } from "@/utils/numberUtils";

interface ListProps {
  leases: Lease[];
  session: Session;
  isMobile: boolean;
}

const List = ({ leases: initialLeases, isMobile }: ListProps) => {
  const t = useTranslations();
  const router = useRouter();
  const [leases] = useState<Lease[]>(initialLeases);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const handleViewLease = useCallback(
    (leaseId: number) => {
      router.push(`/leases/${leaseId}`);
    },
    [router]
  );

  const handleAddNewLease = useCallback(() => {
    router.push("/leases/new");
  }, [router]);

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

  const columns = useMemo(
    () => [
      {
        key: "property",
        label: t("leases.list.property"),
        priority: isMobile ? 1 : undefined,
        render: (lease: Lease) =>
          `${lease.unit.property.name} - ${t("leases.list.unit")} ${
            lease.unit.unitNumber
          }`,
      },
      {
        key: "tenant",
        label: t("leases.list.tenant"),
        priority: isMobile ? 2 : undefined,
        render: (lease: Lease) => lease.tenant.user.name,
      },
      {
        key: "rentAmount",
        label: t("leases.list.monthlyRent"),
        render: (lease: Lease) =>
          formatCurrencyMXN(lease.rentAmount.toString()),
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
          return (
            <Badge status={getBadgeStatus(status)}>
              {t(`common.status.${status.toLowerCase()}`)}
            </Badge>
          );
        },
      },
      {
        key: "document",
        label: t("leases.list.leaseAgreement"),
        render: (lease: Lease) => {
          const hasDocument = lease.documents?.some(
            (doc) => doc.type === "LEASE_AGREEMENT"
          );
          return hasDocument ? (
            <Button
              variant="outline"
              size="md"
              square
              onClick={() => router.push(`/leases/${lease.id}/document`)}
              aria-label={t("leases.list.leaseAgreement")}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  router.push(`/leases/${lease.id}/document`);
              }}
            >
              <FaFilePdf />
            </Button>
          ) : (
            <span className="text-gray-400 text-sm">
              {t("leases.list.noDocument")}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: t("leases.list.actions"),
        priority: isMobile ? 4 : undefined,
        render: (lease: Lease) => (
          <div className="flex space-x-2">
            <Button
              square
              size="md"
              onClick={() => handleViewLease(lease.id)}
              //   aria-label={t("leases.list.view")}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleViewLease(lease.id);
              }}
            >
              <FaEye />
            </Button>
          </div>
        ),
      },
    ],
    [t, router, handleViewLease]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <LoadingSpinner size="lg" color="indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          {leases.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-2xl font-semibold text-gray-800"
                tabIndex={0}
                aria-label={t("leases.title")}
              >
                {t("leases.title")}
              </h2>
              <Button
                onClick={handleAddNewLease}
                aria-label={t("leases.create")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleAddNewLease();
                }}
              >
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">{t("leases.create")}</span>
              </Button>
            </div>
          )}

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
  );
};

export default List;
