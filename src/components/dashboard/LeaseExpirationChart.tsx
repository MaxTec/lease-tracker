import Card from "@/components/ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { format, parseISO } from "date-fns";

interface LeaseExpirationData {
  date: string;
  amount: number;
}

interface LeaseExpirationChartProps {
  data: LeaseExpirationData[];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="font-medium">{label}</p>
        <p className="text-blue-500">
          Amount: ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const LeaseExpirationChart = ({ data }: LeaseExpirationChartProps) => {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card title="Lease Expirations" className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => format(parseISO(value), "MMM dd")}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: "#3B82F6", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}; 