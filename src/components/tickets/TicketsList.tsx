"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import EmptyState from "../ui/EmptyState";
import { Ticket } from "@/types/ticket";

export default function TicketsList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/tickets");
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        const data = await response.json();
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return <div>Loading tickets...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <EmptyState title="No tickets found" description="No tickets found" />
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
      label: "Title",
    },
    {
      key: "property.name",
      label: "Property",
    },
    {
      key: "unit.unitNumber",
      label: "Unit",
    },
    {
      key: "status",
      label: "Status",
      render: (item: Ticket) => (
        <Badge className={getStatusColor(item.status)}>
          {item.status.replace("_", " ")}
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
