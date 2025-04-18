"use client";

import Card from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import { useTranslations } from "next-intl";

interface TicketStatusData {
  status: string;
  _count: number;
}

interface Props {
  data: TicketStatusData[];
  title: string;
}

const COLORS = {
  OPEN: "#EF4444", // Red
  IN_PROGRESS: "#F59E0B", // Yellow
  PENDING_REVIEW: "#3B82F6", // Blue
  RESOLVED: "#10B981", // Green
  CLOSED: "#6B7280", // Gray
};

export function TicketStatusChart({ data, title }: Props) {
  const t = useTranslations();
  
  // Use translations for status labels
  const STATUS_LABELS: Record<string, string> = {
    OPEN: t("tickets.status.open"),
    IN_PROGRESS: t("tickets.status.inProgress"),
    PENDING_REVIEW: t("tickets.status.pendingReview"),
    RESOLVED: t("tickets.status.resolved"),
    CLOSED: t("tickets.status.closed"),
  };
  
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS],
    value: item._count,
    status: item.status,
  }));

  if (data.length === 0) {
    return (
      <Card title={title}>
        <EmptyState
          title={t("dashboard.charts.noTicketData.title")}
          description={t("dashboard.charts.noTicketData.description")}
        />
      </Card>
    );
  }

  return (
    <Card title={title}>
      <div className="p-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
} 