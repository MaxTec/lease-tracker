import Card from "@/components/ui/Card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const MetricCard = ({ title, value, icon, trend }: MetricCardProps) => {
  return (
    <Card title={title} className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center">
              <span
                className={`text-sm ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="ml-2 text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="rounded-full bg-gray-100 p-3 text-gray-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}; 