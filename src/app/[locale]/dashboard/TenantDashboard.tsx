"use client";

import React from "react";
import { TenantDashboardData } from "@/types/dashboard";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Descriptions from "@/components/ui/Descriptions";
import { formatCurrencyMXN } from "@/utils/numberUtils";
import { formatDate, getDayOfMonthLabel } from "@/utils/dateUtils";
import {
  FaMoneyCheckAlt,
  FaCalendarAlt,
  FaExclamationCircle,
  FaFileAlt,
} from "react-icons/fa";
import CreateTicketButton from "@/components/tickets/CreateTicketButton";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Link from "next/link";

export interface TenantDashboardProps {
  tenantDashboardData: TenantDashboardData;
}

const DocItem: React.FC<{ document: Document }> = ({ document }) => {
  return (
    <div className="border rounded-lg px-3 py-2 bg-white shadow">
      <strong className="uppercase text-xs">{document.name}</strong>
      <p>
        <small className="text-xs text-gray-500 mb-2">
          Type: {document.type.replace(/_/g, " ")}
        </small>
      </p>
      <a
        href={document.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 hover:underline"
      >
        View Document
      </a>
      <div className="text-[10px] text-gray-400 mt-1">
        Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

const TenantDashboard: React.FC<TenantDashboardProps> = ({
  tenantDashboardData,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Lease Details Section */}
      <div className="space-y-6 col-span-full">
        {tenantDashboardData.leases.map((lease) => (
          <Descriptions
            key={lease.id}
            // title={`Lease #${lease.id}`}
            bordered
            column={4}
            items={[
              { label: "Unit", children: lease.unit.unitNumber },
              {
                label: "Rent Amount",
                children: formatCurrencyMXN(lease.rentAmount.toString()),
              },
              {
                label: "Deposit Amount",
                children: formatCurrencyMXN(lease.depositAmount.toString()),
              },
              { label: "Start Date", children: formatDate(lease.startDate) },
              { label: "End Date", children: formatDate(lease.endDate) },
              {
                label: "Status",
                children: (
                  <Badge status={lease.status as string}>{lease.status}</Badge>
                ),
              },
              {
                label: "Payment Day",
                children: getDayOfMonthLabel(lease.paymentDay),
              },
            ]}
            className="mb-4"
          />
        ))}
      </div>
      {/* Paid Payments */}
      <Card title="Paid Payments" icon={<FaMoneyCheckAlt />}>
        <Table
          data={tenantDashboardData.paidPayments}
          columns={[
            {
              key: "amount",
              label: "Amount",
              priority: 1,
              render: (payment) => formatCurrencyMXN(payment.amount.toString()),
            },
            {
              key: "dueDate",
              label: "Due Date",
              render: (payment) =>
                payment.dueDate ? formatDate(payment.dueDate) : "-",
            },
            {
              key: "paidDate",
              label: "Paid Date",
              priority: 3,
              render: (payment) =>
                payment.paidDate ? formatDate(payment.paidDate) : "-",
            }
          ]}
          searchable={false}
          pageSize={5}
        />
      </Card>

      {/* Next 5 Payments */}
      <Card
        title="Next 5 Payments"
        icon={<FaCalendarAlt />}
        actions={[
          <a
            key="pay-next-rent"
            href="https://mpago.la/33zYk1k"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
            tabIndex={0}
            aria-label="Pay your next rent via Mercado Pago"
          >
            Pay Next Rent
          </a>,
        ]}
      >
        <Table
          data={tenantDashboardData.nextPayments}
          columns={[
            {
              key: "amount",
              label: "Amount",
              priority: 1,
              render: (payment) => formatCurrencyMXN(payment.amount.toString()),
            },
            {
              key: "dueDate",
              label: "Due Date",
              priority: 2,
              align: "right",
              render: (payment) =>
                payment.dueDate ? formatDate(payment.dueDate) : "-",
            },
          ]}
          searchable={false}
          pageSize={5}
        />
      </Card>

      {/* Tickets List */}
      <Card
        title="Tickets"
        icon={<FaExclamationCircle className="text-yellow-500" />}
        actions={[<CreateTicketButton key="create" />]}
      >
        <Table
          data={tenantDashboardData.tickets}
          columns={[
            {
              key: "title",
              label: "Title",
              priority: 1,
              render: (ticket) => (
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1"
                  tabIndex={0}
                  aria-label={`View details for ticket: ${ticket.title}`}
                >
                  {ticket.title}
                </Link>
              ),
            },
            {
              key: "status",
              label: "Status",
            },
            {
              key: "createdAt",
              label: "Created",
              render: (ticket) =>
                ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleDateString()
                  : "-",
            },
          ]}
          searchable={false}
          pageSize={5}
        />
      </Card>

      {/* Documents Section */}
      <Card title="Relevant Documents" icon={<FaFileAlt />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenantDashboardData.documents.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="No documents found"
                description="You have no relevant documents uploaded."
              />
            </div>
          ) : (
            tenantDashboardData.documents.map((doc) => (
              <DocItem key={doc.id} document={doc} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default TenantDashboard;
