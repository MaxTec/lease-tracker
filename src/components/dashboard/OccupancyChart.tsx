import Card from "@/components/ui/Card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import { FaChartBar } from "react-icons/fa";
import { useTranslations } from "next-intl";

interface OccupancyData {
  name: string;
  value: number;
}

interface OccupancyChartProps {
  data: OccupancyData[];
  title: string;
}

// Updated COLORS to match the specified statuses
const COLORS = {
  ACTIVE: "#10B981",   // Green
  PENDING: "#F59E0B",  // Yellow
  TERMINATED: "#EF4444" // Red
};

export const OccupancyChart = ({ data, title }: OccupancyChartProps) => {
  const t = useTranslations();
  
  console.log('pie data', data);
  return (
    <Card title={title} className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        {data.length === 0 ? (
          <EmptyState
            icon={<FaChartBar className="w-12 h-12" />}
            title={t("dashboard.charts.noOccupancyData.title")}
            description={t("dashboard.charts.noOccupancyData.description")}
          />
        ) : (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${t(`common.status.${name.toLowerCase()}`)} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name as keyof typeof COLORS]} // Use the name to get the correct color
                />
              ))}
            </Pie>
            <Legend verticalAlign="top" height={36} iconSize={12} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
};
