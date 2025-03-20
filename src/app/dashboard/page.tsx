"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import Layout from "@/components/layout/Layout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RentCollectionChart } from "@/components/dashboard/RentCollectionChart";
// import { LeaseExpirationChart } from "@/components/dashboard/LeaseExpirationChart";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import DateInput from "@/components/ui/DateInput";
import Select from "@/components/ui/Select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface DashboardData {
  metrics: {
    totalProperties: number;
    totalUnits: number;
    activeLeases: number;
    totalPayments: number;
    occupancyRate: number;
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
}

interface PropertyOption {
  value: string;
  label: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([
    { value: "", label: "All Properties" },
  ]);

  useEffect(() => {
    const fetchPropertyOptions = async () => {
      try {
        const response = await fetch("/api/properties/options");
        const options = await response.json();
        setPropertyOptions([
          { value: "", label: "All Properties" },
          ...options,
        ]);
      } catch (error) {
        console.error("Error fetching property options:", error);
      }
    };

    fetchPropertyOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (selectedProperty) params.append("propertyId", selectedProperty);

        const response = await fetch(`/api/dashboard?${params.toString()}`);
        const result = await response.json();
        console.log("result", result);
        setData(result);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, selectedProperty]);

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
          <p className="text-gray-500">No data available</p>
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <DateInput
              showMonthYearPicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />
            <DateInput
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              showMonthYearPicker
            />
            <Select
              label="Property"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              options={propertyOptions}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {!selectedProperty && (
            <MetricCard
              title="Total Properties"
              value={data.metrics.totalProperties}
              icon={<span className="text-xl">🏢</span>}
            />
          )}
          <MetricCard
            title="Active Leases"
            value={data.metrics.activeLeases}
            icon={<span className="text-xl">📄</span>}
          />
          <MetricCard
            title="Total Payments"
            value={`$${data.metrics.totalPayments.toLocaleString()}`}
            icon={<span className="text-xl">💰</span>}
          />
          <MetricCard
            title="Occupancy Rate"
            value={`${data.metrics.occupancyRate.toFixed(1)}%`}
            icon={<span className="text-xl">📊</span>}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RentCollectionChart data={data.rentCollectionByMonth} />
          <OccupancyChart data={occupancyData} />
        </div>

        {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LeaseExpirationChart data={leaseExpirationData} />
        </div> */}
      </div>
    </Layout>
  );
}
