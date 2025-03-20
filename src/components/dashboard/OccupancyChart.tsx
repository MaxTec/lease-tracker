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

interface OccupancyData {
  name: string;
  value: number;
}

interface OccupancyChartProps {
  data: OccupancyData[];
}

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

export const OccupancyChart = ({ data }: OccupancyChartProps) => {
  return (
    <Card title="Occupancy Rate" className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        {data.length === 0 ? (
          <EmptyState
            icon={<FaChartBar className="w-12 h-12" />}
            title="No occupancy data available."
            description="Please select a property to view occupancy data."
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
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
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