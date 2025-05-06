"use client";

import { useState, useMemo } from "react";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaTicketAlt } from "react-icons/fa";
import CreateTicketButton from "@/components/tickets/CreateTicketButton";
import { Ticket } from "@/types/ticket";
import { useTranslations } from "next-intl";
import { Session } from "next-auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ListProps {
  tickets: Ticket[];
  session: Session;
}

const List = ({ tickets: initialTickets }: ListProps) => {
  const t = useTranslations();
  const [tickets] = useState<Ticket[]>(initialTickets);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Example: handle ticket deletion (if needed)
  // const handleDeleteTicket = useCallback(async (ticketId: number) => { ... }, []);

  const columns = useMemo(
    () => [
      {
        key: "title",
        label: t("tickets.form.title"),
        render: (ticket: Ticket) => ticket.title,
      },
      {
        key: "status",
        label: t("tickets.form.status"),
        render: (ticket: Ticket) => ticket.status,
      },
      {
        key: "priority",
        label: t("tickets.form.priority"),
        render: (ticket: Ticket) => ticket.priority,
      },
      {
        key: "unit",
        label: t("tickets.form.unit"),
        render: (ticket: Ticket) => ticket.unit?.unitNumber || "-",
      },
      {
        key: "property",
        label: t("tickets.form.property"),
        render: (ticket: Ticket) => ticket.unit?.property?.name || "-",
      },
      {
        key: "tenant",
        label: t("tickets.form.tenant"),
        render: (ticket: Ticket) => ticket.tenant?.user?.name || "-",
      },
      // Add more columns as needed
    ],
    [t]
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
      <div className="bg-red-50 text-red-600 p-4 rounded-md" role="alert">{error}</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold" tabIndex={0} aria-label={t("tickets.title")}>{t("tickets.title")}</h2>
            <CreateTicketButton />
          </div>
          {tickets.length > 0 ? (
            <Table
              data={tickets}
              columns={columns}
              searchable={true}
              searchKeys={["title", "status", "priority", "unit.unitNumber", "tenant.user.name"]}
              pageSize={10}
            />
          ) : (
            <EmptyState
              icon={<FaTicketAlt className="w-12 h-12" />}
              title={t("tickets.emptyState.title")}
              description={t("tickets.emptyState.description")}
              actionLabel={t("tickets.create")}
              onAction={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default List; 