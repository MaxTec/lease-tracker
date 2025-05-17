"use client";

import { useState, useEffect } from "react";
import DateInput from "@/components/ui/DateInput";
import Select from "@/components/ui/Select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useTranslations } from "next-intl";
import type { DashboardData } from "@/types/dashboard";
import LandlordDashboard from "@/components/dashboard/landlord-dashboard";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import { Session } from "next-auth";
import { format, startOfMonth, endOfMonth, parse, startOfYear, endOfYear } from "date-fns";
interface PropertyOption {
  value: string;
  label: string;
}

interface DashboardProps {
  dashboardData: DashboardData;
  session: Session;
  defaultViewMode: "month" | "year";
  defaultSelectedDate: string;
  defaultSelectedProperty: string;
}

const Dashboard = ({
  dashboardData: initialDashboardData,
  session,
  defaultViewMode,
  defaultSelectedDate,
  defaultSelectedProperty,
}: DashboardProps) => {
  const t = useTranslations();
  const [data, setData] = useState<DashboardData | null>(initialDashboardData);
  const [viewMode, setViewMode] = useState<"month" | "year">(defaultViewMode);
  const [selectedDate, setSelectedDate] = useState<string>(defaultSelectedDate);
  const [selectedProperty, setSelectedProperty] = useState<string>(defaultSelectedProperty);
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([
    { value: "", label: t("dashboard.filters.allProperties") },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyOptions = async () => {
      try {
        const params = new URLSearchParams();
        if (session.user.role) params.append("userRole", session.user.role);
        if (session.user.id) params.append("userId", session.user.id.toString());
        const response = await fetch(`/api/properties/options?${params.toString()}`);
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
  }, [t, session.user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let start: string;
        let end: string;
        if (viewMode === "month") {
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
        if (session.user.role) params.append("userRole", session.user.role);
        if (session.user.id) params.append("userId", session.user.id.toString());
        const response = await fetch(`/api/dashboard?${params.toString()}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
         
        console.error("Error fetching dashboard data:", error);
        setError(t("dashboard.noData"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate, selectedProperty, viewMode, session.user, t]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">{t("dashboard.noData")}</p>
      </div>
    );
  }

  // Filters always visible
  const Filters = (
    <div className="flex flex-col gap-4">
      <div className="bg-white">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("dashboard.filters.viewMode")}
            </label>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => {
                  setViewMode("month");
                  const currentDate =
                    viewMode === "year"
                      ? parse(selectedDate, "yyyy", new Date())
                      : parse(selectedDate + "-01", "yyyy-MM-dd", new Date());
                  setSelectedDate(format(currentDate, "yyyy-MM"));
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md ${
                  viewMode === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                } transition-colors`}
                aria-label={t("common.dates.month")}
              >
                {t("common.dates.month")}
              </button>
              <button
                onClick={() => {
                  setViewMode("year");
                  const currentDate =
                    viewMode === "month"
                      ? parse(selectedDate + "-01", "yyyy-MM-dd", new Date())
                      : parse(selectedDate, "yyyy", new Date());
                  setSelectedDate(format(currentDate, "yyyy"));
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md ${
                  viewMode === "year"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                } transition-colors`}
                aria-label={t("common.dates.year")}
              >
                {t("common.dates.year")}
              </button>
            </div>
          </div>
          <DateInput
            showMonthYearPicker={viewMode === "month"}
            showYearPicker={viewMode === "year"}
            label={
              viewMode === "month"
                ? t("dashboard.filters.selectMonth")
                : t("dashboard.filters.selectYear")
            }
            value={selectedDate}
            onChange={setSelectedDate}
            className="w-full"
          />
          {session.user.role !== "TENANT" && (
            <Select
              label={t("dashboard.filters.property")}
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              options={propertyOptions}
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:space-y-6 md:p-6">
      {Filters}
      {session.user.role === "LANDLORD" && <LandlordDashboard data={data} />}
      {session.user.role === "ADMIN" && (
        <AdminDashboard
          data={data}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}
      {session.user.role === "TENANT" && (
        <div className="text-gray-500">Tenant dashboard coming soon</div>
      )}
    </div>
  );
};

export default Dashboard; 