"use client";

import Card from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import EmptyState from "@/components/ui/EmptyState";
interface TicketStatusData {
  status: string;
  _count: number;
}

interface Props {
  data: TicketStatusData[];
}

const COLORS = {
  OPEN: "#EF4444", // Red
  IN_PROGRESS: "#F59E0B", // Yellow
  PENDING_REVIEW: "#3B82F6", // Blue
  RESOLVED: "#10B981", // Green
  CLOSED: "#6B7280", // Gray
};

const STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  PENDING_REVIEW: "Pending Review",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function TicketStatusChart({ data }: Props) {
  const chartData = data.map((item) => ({
    name: STATUS_LABELS[item.status as keyof typeof STATUS_LABELS],
    value: item._count,
    status: item.status,
  }));

  if (data.length === 0) {
    return (
      <Card title="Ticket Status Distribut  ion">
        <EmptyState
          title="No tickets found for the selected period"
          description="Please select a different period or check back later."
        />
      </Card>
    );
  }

  return (
    <Card title="Ticket Status Distribution">
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