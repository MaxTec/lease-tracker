"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import EmptyState from "../ui/EmptyState";
import { Ticket } from "@/types/ticket";
import { useTranslations } from "next-intl";

export default function TicketsList() {
  const t = useTranslations();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/tickets");
        if (!response.ok) {
          throw new Error(t("tickets.errors.fetchFailed"));
        }
        const data = await response.json();
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("tickets.errors.fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [t]);

  if (loading) {
    return <div>{t("common.loading")}</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <EmptyState 
          title={t("tickets.emptyState.title")} 
          description={t("tickets.emptyState.description")} 
        />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      OPEN: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      PENDING_REVIEW: "bg-purple-100 text-purple-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const columns = [
    {
      key: "title",
      label: t("tickets.form.title"),
    },
    {
      key: "property.name",
      label: t("tickets.form.property"),
    },
    {
      key: "unit.unitNumber",
      label: t("tickets.form.unit"),
    },
    {
      key: "status",
      label: t("tickets.form.status"),
      render: (item: Ticket) => (
        <Badge className={getStatusColor(item.status)}>
          {t(`tickets.status.${item.status.toLowerCase().replace("_", "")}`)}
        </Badge>
      ),
    },
  ];
  return (
    <div className="rounded-md border">
      <Table
        data={tickets}
        columns={columns}
        searchable={true}
        searchKeys={["title", "status", "priority", "createdAt"]}
      ></Table>
    </div>
  );
}
