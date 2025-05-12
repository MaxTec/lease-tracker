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
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { FiPaperclip } from "react-icons/fi";

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

  const getTicketBadgeStatus = (status: string) => {
    switch (status) {
      case "OPEN":
        return "warning";
      case "IN_PROGRESS":
        return "info";
      case "PENDING_REVIEW":
        return "info";
      case "RESOLVED":
        return "success";
      case "CLOSED":
        return "success";
      default:
        return "default";
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "title",
        label: t("tickets.form.title"),
        render: (ticket: Ticket) => (
          <Link
            href={`/tickets/${ticket.id}`}
            className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1 flex items-center gap-1"
            tabIndex={0}
            aria-label={`${t("tickets.form.title")}: ${ticket.title}`}
          >
            {ticket.title}
            {Array.isArray(ticket.images) && ticket.images.length > 0 && (
              <FiPaperclip
                className="inline-block text-gray-400 ml-1"
                size={16}
                aria-label="Has attachments"
                title="Has attachments"
              />
            )}
          </Link>
        ),
      },
      {
        key: "status",
        label: t("tickets.form.status"),
        render: (ticket: Ticket) => (
          <Badge status={getTicketBadgeStatus(ticket.status)}>
            {ticket.status}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("tickets.form.created"),
        render: (ticket: Ticket) =>
          ticket.createdAt
            ? new Date(ticket.createdAt).toLocaleDateString()
            : "-",
      },
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
      <div className="bg-red-50 text-red-600 p-4 rounded-md" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <h2
              className="text-3xl font-bold"
              tabIndex={0}
              aria-label={t("tickets.title")}
            >
              {t("tickets.title")}
            </h2>
            <CreateTicketButton />
          </div>
          {tickets.length > 0 ? (
            <Table
              data={tickets}
              columns={columns}
              searchable={false}
              pageSize={5}
            />
          ) : (
            <EmptyState
              icon={<FaTicketAlt className="w-12 h-12" />}
              title={t("tickets.emptyState.title")}
              description={t("tickets.emptyState.description")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default List;
