"use client";

import React from "react";
import { TenantDashboardData } from "@/types/dashboard";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Descriptions from "@/components/ui/Descriptions";
import { formatCurrencyMXN } from "@/utils/numberUtils";
import { formatDate, getDayOfMonthLabel } from "@/utils/dateUtils";
import { FaMoneyCheckAlt, FaCalendarAlt, FaExclamationCircle, FaFileAlt } from "react-icons/fa";
import CreateTicketButton from "@/components/tickets/CreateTicketButton";
import Badge from "@/components/ui/Badge";
import { BadgeStatus } from "@/components/ui/Badge";  

export interface TenantDashboardProps {
  tenantDashboardData: TenantDashboardData;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ tenantDashboardData }) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Lease Details Section */}
      <div className='space-y-6 col-span-full'>
        {tenantDashboardData.leases.map((lease) => (
          <Descriptions
            key={lease.id}
            // title={`Lease #${lease.id}`}
            bordered
            column={4}
            items={[
              { label: "Unit", children: lease.unit.unitNumber },
              { label: "Rent Amount", children: formatCurrencyMXN(lease.rentAmount.toString()) },
              { label: "Deposit Amount", children: formatCurrencyMXN(lease.depositAmount.toString()) },
              { label: "Start Date", children: formatDate(lease.startDate) },
              { label: "End Date", children: formatDate(lease.endDate) },
              { label: "Status", children: <Badge status={lease.status as BadgeStatus}>{lease.status}</Badge> },
              { label: "Payment Day", children: getDayOfMonthLabel(lease.paymentDay) },
            ]}
            className='mb-4'
          />
        ))}
      </div>
      {/* Paid Payments */}
      <Card title='Paid Payments' icon={<FaMoneyCheckAlt />}>
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='px-4 py-2'>Amount</th>
                <th className='px-4 py-2'>Due Date</th>
                <th className='px-4 py-2'>Paid Date</th>
                <th className='px-4 py-2'>Status</th>
              </tr>
            </thead>
            <tbody>
              {tenantDashboardData.paidPayments.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState title='No paid payments found' description='You have not made any payments yet.' />
                  </td>
                </tr>
              ) : (
                tenantDashboardData.paidPayments.map((payment) => (
                  <tr key={payment.id} className='border-t'>
                    <td className='px-4 py-2'>${payment.amount.toFixed(2)}</td>
                    <td className='px-4 py-2'>{new Date(payment.dueDate).toLocaleDateString()}</td>
                    <td className='px-4 py-2'>{payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : "-"}</td>
                    <td className='px-4 py-2'>{payment.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Next 5 Payments */}
      <Card title='Next 5 Payments' icon={<FaCalendarAlt />}>
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='px-4 py-2'>Amount</th>
                <th className='px-4 py-2'>Due Date</th>
                <th className='px-4 py-2'>Status</th>
              </tr>
            </thead>
            <tbody>
              {tenantDashboardData.nextPayments.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <EmptyState title='No upcoming payments found' description='You have no upcoming payments scheduled.' />
                  </td>
                </tr>
              ) : (
                tenantDashboardData.nextPayments.map((payment) => (
                  <tr key={payment.id} className='border-t'>
                    <td className='px-4 py-2'>${payment.amount.toFixed(2)}</td>
                    <td className='px-4 py-2'>{new Date(payment.dueDate).toLocaleDateString()}</td>
                    <td className='px-4 py-2'>{payment.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tickets List */}
      <Card title='Tickets' icon={<FaExclamationCircle className='text-yellow-500' />} actions={[<CreateTicketButton key='create' />]}>
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='px-4 py-2'>Title</th>
                <th className='px-4 py-2'>Status</th>
                <th className='px-4 py-2'>Created</th>
              </tr>
            </thead>
            <tbody>
              {tenantDashboardData.tickets.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <EmptyState title='No tickets found' description='You have not created any tickets yet.' />
                  </td>
                </tr>
              ) : (
                tenantDashboardData.tickets.map((ticket) => (
                  <tr key={ticket.id} className='border-t'>
                    <td className='px-4 py-2'>{ticket.title}</td>
                    <td className='px-4 py-2'>{ticket.status}</td>
                    <td className='px-4 py-2'>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Documents Section */}
      <Card title='Relevant Documents' icon={<FaFileAlt />}>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {tenantDashboardData.documents.length === 0 ? (
            <div className='col-span-full'>
              <EmptyState title='No documents found' description='You have no relevant documents uploaded.' />
            </div>
          ) : (
            tenantDashboardData.documents.map((doc) => (
              <div key={doc.id} className='border rounded-lg p-4 bg-white shadow'>
                <div className='font-medium'>{doc.name}</div>
                <div className='text-sm text-gray-500 mb-2'>Type: {doc.type.replace(/_/g, " ")}</div>
                <a href={doc.fileUrl} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>
                  View Document
                </a>
                <div className='text-xs text-gray-400 mt-1'>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default TenantDashboard;
