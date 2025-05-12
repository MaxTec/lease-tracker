import React from "react";
import { MetricCard } from "./MetricCard";
import { RentCollectionChart } from "./RentCollectionChart";
import { OccupancyChart } from "./OccupancyChart";
import { TicketStatusChart } from "./TicketStatusChart";
import { useTranslations } from "next-intl";
import type { DashboardData } from "@/types/dashboard";

interface AdminDashboardProps {
  data: DashboardData;
  viewMode?: "month" | "year";
  onViewModeChange?: (mode: "month" | "year") => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data }) => {
  const t = useTranslations();

  const occupancyData = data.occupancyBreakdown.map((item: { status: string; _count: number }) => ({
    name: item.status,
    value: item._count,
  }));

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard title={t("dashboard.summary.properties")} value={data.metrics.totalProperties} icon={<span className='text-xl'>🏢</span>} />
        <MetricCard title={t("dashboard.summary.activeLeases")} value={data.metrics.activeLeases} icon={<span className='text-xl'>📄</span>} />
        <MetricCard title={t("dashboard.summary.totalPayments")} value={`$${data.metrics.totalPayments.toLocaleString()}`} icon={<span className='text-xl'>💰</span>} />
        <MetricCard title={t("dashboard.summary.occupancyRate")} value={`${data.metrics.occupancyRate.toFixed(1)}%`} icon={<span className='text-xl'>📊</span>} />
        <MetricCard title={t("dashboard.summary.totalTickets")} value={data.metrics.totalTickets} icon={<span className='text-xl'>🎫</span>} />
      </div>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <RentCollectionChart title={t("dashboard.charts.rentCollection")} data={data.rentCollectionByMonth} />
        <OccupancyChart title={t("dashboard.charts.occupancyRate")} data={occupancyData} />
      </div>
      <TicketStatusChart title={t("dashboard.charts.ticketsByStatus")} data={data.ticketsByStatus} />
    </div>
  );
};

export default AdminDashboard;
