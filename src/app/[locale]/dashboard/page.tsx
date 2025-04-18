"use client";

import { useEffect, useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, parse, startOfYear, endOfYear } from "date-fns";
import Layout from "@/components/layout/Layout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RentCollectionChart } from "@/components/dashboard/RentCollectionChart";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { TicketStatusChart } from "@/components/dashboard/TicketStatusChart";
import DateInput from "@/components/ui/DateInput";
import Select from "@/components/ui/Select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useTranslations } from "next-intl";

interface DashboardData {
  metrics: {
    totalProperties: number;
    totalUnits: number;
    activeLeases: number;
    totalPayments: number;
    occupancyRate: number;
    totalTickets: number;
  };
  rentCollection: {
    status: string;
    _sum: {
      amount: number;
    };
  }[];
  rentCollectionByMonth: {
    month: string;
    totalAmount: number;
  }[];
  leaseExpirations: {
    endDate: string;
    rentAmount: number;
  }[];
  occupancyBreakdown: {
    status: string;
    _count: number;
  }[];
  ticketsByStatus: {
    status: string;
    _count: number;
  }[];
}

interface PropertyOption {
  value: string;
  label: string;
}

export default function Dashboard() {
  const t = useTranslations();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return format(now, viewMode === 'month' ? "yyyy-MM" : "yyyy");
  });
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([
    { value: "", label: t("dashboard.filters.allProperties") },
  ]);

  useEffect(() => {
    const fetchPropertyOptions = async () => {
      try {
        const response = await fetch("/api/properties/options");
        const options = await response.json();
        setPropertyOptions([
          { value: "", label: t("dashboard.filters.allProperties") },
          ...options,
        ]);
      } catch (error) {
        console.error("Error fetching property options:", error);
      }
    };

    fetchPropertyOptions();
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let start: string;
        let end: string;

        if (viewMode === 'month') {
          const monthDate = parse(selectedDate + "-01", "yyyy-MM-dd", new Date());
          start = format(startOfMonth(monthDate), "yyyy-MM-dd");
          end = format(endOfMonth(monthDate), "yyyy-MM-dd");
        } else {
          const yearDate = parse(selectedDate, "yyyy", new Date());
          start = format(startOfYear(yearDate), "yyyy-MM-dd");
          end = format(endOfYear(yearDate), "yyyy-MM-dd");
        }
        
        const params = new URLSearchParams();
        params.append("startDate", start);
        params.append("endDate", end);
        if (selectedProperty) params.append("propertyId", selectedProperty);

        const response = await fetch(`/api/dashboard?${params.toString()}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, selectedProperty, viewMode]);

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <p className="text-gray-500">{t("dashboard.noData")}</p>
        </div>
      </Layout>
    );
  }

  console.log("rentCollectionData", data.rentCollection);
  console.log("rentCollectionByMonth", data.rentCollectionByMonth);

  const leaseExpirationData = data.leaseExpirations.map((item) => ({
    date: format(parseISO(item.endDate), "MMM dd"),
    amount: Number(item.rentAmount),
  }));
  console.log("leaseExpirationData", leaseExpirationData);

  const occupancyData = data.occupancyBreakdown.map((item) => ({
    name: item.status,
    value: item._count,
  }));

  console.log("occupancyData", occupancyData);

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4">
          <div className="bg-white">
            {/* <h2 className="text-lg font-semibold text-gray-700 mb-4">Dashboard Filters</h2> */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t("dashboard.filters.viewMode")}</label>
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => {
                      setViewMode('month');
                      const currentDate = viewMode === 'year'
                        ? parse(selectedDate, "yyyy", new Date())
                        : parse(selectedDate + "-01", "yyyy-MM-dd", new Date());
                      setSelectedDate(format(currentDate, "yyyy-MM"));
                    }}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md ${
                      viewMode === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    } transition-colors`}
                  >
                    {t("common.dates.month")}
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('year');
                      const currentDate = viewMode === 'month'
                        ? parse(selectedDate + "-01", "yyyy-MM-dd", new Date())
                        : parse(selectedDate, "yyyy", new Date());
                      setSelectedDate(format(currentDate, "yyyy"));
                    }}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md ${
                      viewMode === 'year'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    } transition-colors`}
                  >
                    {t("common.dates.year")}
                  </button>
                </div>
              </div>

              <DateInput
                showMonthYearPicker={viewMode === 'month'}
                showYearPicker={viewMode === 'year'}
                label={viewMode === 'month' ? t("dashboard.filters.selectMonth") : t("dashboard.filters.selectYear")}
                value={selectedDate}
                onChange={setSelectedDate}
                className="w-full"
              />

              <Select
                label={t("dashboard.filters.property")}
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                options={propertyOptions}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {!selectedProperty && (
            <MetricCard
              title={t("dashboard.summary.properties")}
              value={data.metrics.totalProperties}
              icon={<span className="text-xl">🏢</span>}
            />
          )}
          <MetricCard
            title={t("dashboard.summary.activeLeases")}
            value={data.metrics.activeLeases}
            icon={<span className="text-xl">📄</span>}
          />
          <MetricCard
            title={t("dashboard.summary.totalPayments")}
            value={`$${data.metrics.totalPayments.toLocaleString()}`}
            icon={<span className="text-xl">💰</span>}
          />
          <MetricCard
            title={t("dashboard.summary.occupancyRate")}
            value={`${data.metrics.occupancyRate.toFixed(1)}%`}
            icon={<span className="text-xl">📊</span>}
          />
          <MetricCard
            title={t("dashboard.summary.totalTickets")}
            value={data.metrics.totalTickets}
            icon={<span className="text-xl">🎫</span>}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RentCollectionChart title={t("dashboard.charts.rentCollection")} data={data.rentCollectionByMonth} />
          <OccupancyChart title={t("dashboard.charts.occupancyRate")} data={occupancyData} />
        </div>
        
        <TicketStatusChart title={t("dashboard.charts.ticketsByStatus")} data={data.ticketsByStatus} />
      </div>
    </Layout>
  );
}


