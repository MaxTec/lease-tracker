import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// @ts-expect-error: Dashboard will be created next
import Dashboard from "./Dashboard";
import Layout from "@/components/layout/Layout";
import { DashboardData } from "@/types/dashboard";
import { format } from "date-fns";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");

  // Default filters
  const now = new Date();
  const defaultViewMode = "year";
  const defaultSelectedDate = format(now, "yyyy");
  const defaultSelectedProperty = "";

  // Build params for API call
  const params = new URLSearchParams();
  params.append("viewMode", defaultViewMode);
  params.append("selectedDate", defaultSelectedDate);
  if (defaultSelectedProperty) params.append("propertyId", defaultSelectedProperty);
  if (session.user.role) params.append("userRole", session.user.role);
  if (session.user.id) params.append("userId", session.user.id.toString());

  const res = await fetch(`${process.env.NEXTAUTH_URL || ""}/api/dashboard?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <Layout>
        <div className="text-red-600 p-4">Failed to fetch dashboard data.</div>
      </Layout>
    );
  }
  const dashboardData: DashboardData = await res.json();

  return (
    <Layout>
      <Dashboard
        dashboardData={dashboardData}
        session={session}
        defaultViewMode={defaultViewMode}
        defaultSelectedDate={defaultSelectedDate}
        defaultSelectedProperty={defaultSelectedProperty}
      />
    </Layout>
  );
}
