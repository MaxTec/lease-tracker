import Card from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { format, parseISO } from "date-fns";
import EmptyState from "@/components/ui/EmptyState";
import { FaChartBar } from "react-icons/fa";
interface RentCollectionData {
  month: string;
  totalAmount: number;
}

interface RentCollectionChartProps {
  data: RentCollectionData[];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const RentCollectionChart = ({ data }: RentCollectionChartProps) => {
  // Sort data by month
  const sortedData = [...data].sort((a, b) => {
    const dateA = parseISO(a.month);
    const dateB = parseISO(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  console.log("sortedData", sortedData);

  return (
    <Card title="Rent Collection" className="h-[400px]">
      {sortedData.length === 0 ? (
        <EmptyState
          icon={<FaChartBar className="w-12 h-12" />}
          title="No rent collection data available."
          description="Please select a property to view rent collection data."
        />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => format(parseISO(value), "MMM yyyy")}
            />
            <YAxis
              dataKey="totalAmount"
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalAmount" fill="#10B981" name="Paid" />
            {/* <Bar dataKey="pending" fill="#F59E0B" name="Pending" /> */}
            {/* <Bar dataKey="overdue" fill="#EF4444" name="Overdue" /> */}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};
