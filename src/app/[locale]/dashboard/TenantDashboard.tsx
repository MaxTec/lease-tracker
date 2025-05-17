"use client";

import React, { useState } from "react";
import { TenantDashboardData } from "@/types/dashboard";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Descriptions from "@/components/ui/Descriptions";
import { formatCurrencyMXN } from "@/utils/numberUtils";
import { formatDate, getDayOfMonthLabel } from "@/utils/dateUtils";
import { FcMoneyTransfer, FcCalendar, FcDocument, FcHighPriority } from "react-icons/fc";
import CreateTicketButton from "@/components/tickets/CreateTicketButton";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FaEdit } from "react-icons/fa";
import { FiPaperclip, FiExternalLink } from "react-icons/fi";
import Button from "@/components/ui/Button";

export interface TenantDashboardProps {
  tenantDashboardData: TenantDashboardData;
}

type TenantDocument = {
  id: number;
  name: string;
  type: "LEASE_AGREEMENT" | "ADDENDUM" | "INSPECTION_REPORT" | "NOTICE" | "OTHER";
  fileUrl: string;
  uploadedAt: string;
};

const DocItem: React.FC<{ document: TenantDocument }> = ({ document }) => {
  const t = useTranslations("tenantDashboard.documents");
  return (
    <div className='border rounded-lg px-3 py-2 bg-white shadow'>
      <strong className='uppercase text-xs'>{document.name}</strong>
      <p>
        <small className='text-xs text-gray-500 mb-2'>
          {t("type")}: {document.type.replace(/_/g, " ")}
        </small>
      </p>
      <a href={document.fileUrl} target='_blank' rel='noopener noreferrer' className='text-xs text-blue-600 hover:underline'>
        {t("view")}
      </a>
      <div className='text-[10px] text-gray-400 mt-1'>
        {t("uploaded")}: {new Date(document.uploadedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

const TenantDashboard: React.FC<TenantDashboardProps> = ({ tenantDashboardData }) => {
  const tLease = useTranslations("tenantDashboard.leaseDetails");
  const tPaid = useTranslations("tenantDashboard.paidPayments");
  const tNext = useTranslations("tenantDashboard.nextPayments");
  const tTickets = useTranslations("tenantDashboard.tickets");
  const tDocs = useTranslations("tenantDashboard.documents");

  const [editingPhoneLeaseId, setEditingPhoneLeaseId] = useState<number | null>(null);
  const [phoneInput, setPhoneInput] = useState<string>("");

  // Map lease status to BadgeStatus
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

  // Map ticket status to BadgeStatus
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

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Lease Details Section */}
      <div className='space-y-6 col-span-full'>
        {tenantDashboardData.leases.map((lease) => (
          <Descriptions
            key={lease.id}
            bordered
            column={5}
            items={[
              { label: tLease("unit"), children: lease.unit.unitNumber },
              {
                label: tLease("rentAmount"),
                children: formatCurrencyMXN(lease.rentAmount.toString()),
              },
              {
                label: tLease("depositAmount"),
                children: formatCurrencyMXN(lease.depositAmount.toString()),
              },
              {
                label: tLease("startDate"),
                children: formatDate(lease.startDate),
              },
              { label: tLease("endDate"), children: formatDate(lease.endDate) },
              {
                label: tLease("status"),
                children: <Badge status={getBadgeStatus(lease.status)}>{lease.status}</Badge>,
              },
              {
                label: tLease("paymentDay"),
                children: getDayOfMonthLabel(lease.paymentDay),
              },
              {
                label: tLease("phone") || "Phone",
                children:
                  editingPhoneLeaseId === lease.id ? (
                    <div className='flex items-center gap-2'>
                      <input type='text' className='border rounded px-2 py-1 text-sm' value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} autoFocus />
                      <button className='text-green-600 hover:text-green-800 text-xs border border-green-600 rounded px-2 py-1' onClick={() => setEditingPhoneLeaseId(null)}>
                        Save
                      </button>
                      <button className='text-gray-500 hover:text-gray-700 text-xs border border-gray-300 rounded px-2 py-1' onClick={() => setEditingPhoneLeaseId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className='flex items-center gap-2'>
                      <span>{lease.tenant.phone || "-"}</span>
                      <button
                        className='text-gray-400 hover:text-blue-600 focus:outline-none'
                        aria-label='Edit phone'
                        onClick={() => {
                          setEditingPhoneLeaseId(lease.id);
                          setPhoneInput(lease.tenant.phone || "");
                        }}
                      >
                        <FaEdit size={14} />
                      </button>
                    </div>
                  ),
              },
              {
                label: tLease("emergencyContact") || "Emergency Contact",
                children: lease.tenant.emergencyContact || "-",
              },
            ]}
            className='mb-4'
          />
        ))}
      </div>
      {/* Paid Payments */}
      <Card title={tPaid("title")} icon={<FcMoneyTransfer size={32} />}>
        {tenantDashboardData.paidPayments.length === 0 ? (
          <EmptyState title={tPaid("emptyTitle")} description={tPaid("emptyDescription")} />
        ) : (
          <Table
            data={tenantDashboardData.paidPayments}
            columns={[
              {
                key: "amount",
                label: tPaid("amount"),
                priority: 1,
                render: (payment) => formatCurrencyMXN(payment.amount.toString()),
              },
              {
                key: "dueDate",
                label: tPaid("dueDate"),
                render: (payment) => (payment.dueDate ? formatDate(payment.dueDate) : "-"),
              },
              {
                key: "paidDate",
                label: tPaid("paidDate"),
                priority: 3,
                render: (payment) => (payment.paidDate ? formatDate(payment.paidDate) : "-"),
              },
              {
                key: "voucher",
                label: tPaid("voucher") || "Voucher",
                render: (payment) => {
                  const voucherNumber = payment?.voucher?.voucherNumber;
                  return (
                    <Link
                      href={`vouchers/${voucherNumber}`}
                      className='text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1'
                      tabIndex={0}
                      aria-label={`View voucher for payment ${payment.id}`}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <FiExternalLink size={26} />
                      </div>
                    </Link>
                  );
                },
              },
            ]}
            searchable={false}
            pageSize={5}
          />
        )}
      </Card>

      {/* Next 5 Payments */}
      <Card
        title={tNext("title")}
        icon={<FcCalendar size={32} />}
        actions={
          tenantDashboardData.nextPayments.length > 0
            ? [
                <Button
                  key='pay-next-rent'
                  variant='primary'
                  size='md'
                  onClick={() => {
                    window.open("https://mpago.la/33zYk1k", "_blank");
                  }}
                >
                  {tNext("payNextRent")}
                </Button>,
              ]
            : []
        }
      >
        {tenantDashboardData.nextPayments.length === 0 ? (
          <EmptyState title={tNext("emptyTitle")} description={tNext("emptyDescription")} />
        ) : (
          <Table
            data={tenantDashboardData.nextPayments}
            columns={[
              {
                key: "amount",
                label: tNext("amount"),
                priority: 1,
                render: (payment) => (
                  <div className='flex items-center gap-2'>
                    {formatCurrencyMXN(payment.amount.toString())}
                    {payment.status === "OVERDUE" && (
                      <Badge status='error' aria-label='Overdue Payment'>
                        OVERDUE
                      </Badge>
                    )}
                  </div>
                ),
              },
              {
                key: "dueDate",
                label: tNext("dueDate"),
                priority: 2,
                align: "right",
                render: (payment) => (payment.dueDate ? formatDate(payment.dueDate) : "-"),
              },
            ]}
            searchable={false}
            pageSize={5}
          />
        )}
      </Card>

      {/* Tickets List */}
      <Card title={tTickets("title")} icon={<FcHighPriority size={32} />} actions={tenantDashboardData.leases[0].status === "ACTIVE" ? [<CreateTicketButton key='create' />] : []}>
        {tenantDashboardData.tickets.length === 0 ? (
          <EmptyState title={tTickets("emptyTitle")} description={tTickets("emptyDescription")} />
        ) : (
          <Table
            data={tenantDashboardData.tickets}
            columns={[
              {
                key: "title",
                label: tTickets("titleCol"),
                priority: 1,
                render: (ticket) => (
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className='text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1 flex items-center gap-1'
                    tabIndex={0}
                    aria-label={`${tTickets("titleCol")}: ${ticket.title}`}
                  >
                    {ticket.title}
                    {Array.isArray(ticket.images) && ticket.images.length > 0 && (
                      <FiPaperclip className='inline-block text-gray-400 ml-1' size={16} aria-label='Has attachments' title='Has attachments' />
                    )}
                  </Link>
                ),
              },
              {
                key: "status",
                label: tTickets("status"),
                render: (ticket) => <Badge status={getTicketBadgeStatus(ticket.status)}>{ticket.status}</Badge>,
              },
              {
                key: "createdAt",
                label: tTickets("created"),
                render: (ticket) => (ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "-"),
              },
            ]}
            searchable={false}
            pageSize={5}
          />
        )}
      </Card>

      {/* Documents Section */}
      <Card title={tDocs("title")} icon={<FcDocument size={32} />}>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {tenantDashboardData.documents.length === 0 ? (
            <div className='col-span-full'>
              <EmptyState title={tDocs("emptyTitle")} description={tDocs("emptyDescription")} />
            </div>
          ) : (
            tenantDashboardData.documents.map((doc) => <DocItem key={doc.id} document={doc} />)
          )}
        </div>
      </Card>
    </div>
  );
};

export default TenantDashboard;
