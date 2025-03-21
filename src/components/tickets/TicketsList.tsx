"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  property: {
    name: string;
  };
  unit: {
    unitNumber: string;
  };
}

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
        <p className="text-gray-500">No tickets found.</p>
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

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
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
    },
  ];
  return (
    <div className="rounded-md border">
       {/* data={leases}
                columns={columns}
                searchable={true}
                searchKeys={[
                  "unit.property.name",
                  "unit.unitNumber",
                  "tenant.user.name",
                  "status",
                ]} */}
      <Table
        data={tickets}
        columns={columns}
        searchable={true}
        searchKeys={["title", "status", "priority", "createdAt"]}
      >
        {/* <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {ticket.title}
                </Link>
              </TableCell>
              <TableCell>{ticket.property.name}</TableCell>
              <TableCell>{ticket.unit.unitNumber}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody> */}
      </Table>
    </div>
  );
}
