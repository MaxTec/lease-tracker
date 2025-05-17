import React from "react";
import { MetricCard } from "./MetricCard";
import { RentCollectionChart } from "./RentCollectionChart";
import { OccupancyChart } from "./OccupancyChart";
import { TicketStatusChart } from "./TicketStatusChart";
import { useTranslations } from "next-intl";
import type { DashboardData } from "@/types/dashboard";
import { formatCurrencyMXN } from "@/utils/numberUtils";
interface LandlordDashboardProps {
  data: DashboardData;
}

const LandlordDashboard: React.FC<LandlordDashboardProps> = ({ data }) => {
  const t = useTranslations();

  const occupancyData = data.occupancyBreakdown.map(
    (item: { status: string; _count: number }) => ({
      name: item.status,
      value: item._count,
    })
  );

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t("dashboard.summary.properties")}
          value={data.metrics.totalProperties}
          icon={<span className="text-xl">🏢</span>}
        />
        <MetricCard
          title={t("dashboard.summary.activeLeases")}
          value={data.metrics.activeLeases}
          icon={<span className="text-xl">📄</span>}
        />
        <MetricCard
          title={t("dashboard.summary.totalPayments")}
          value={formatCurrencyMXN(data.metrics.totalPayments)}
          icon={<span className="text-xl">💰</span>}
        />
        <MetricCard
          title={t("dashboard.summary.totalTickets")}
          value={data.metrics.totalTickets}
          icon={<span className="text-xl">🎫</span>}
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RentCollectionChart
          title={t("dashboard.charts.rentCollection")}
          data={data.rentCollectionByMonth}
        />
        <OccupancyChart
          title={t("dashboard.charts.occupancyRate")}
          data={occupancyData}
        />
      </div>
      <TicketStatusChart
        title={t("dashboard.charts.ticketsByStatus")}
        data={data.ticketsByStatus}
      />
    </div>
  );
};

export default LandlordDashboard;
