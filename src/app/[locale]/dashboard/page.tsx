import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Dashboard from "./Dashboard";
import TenantDashboard from "./TenantDashboard";
import Layout from "@/components/layout/Layout";
import { DashboardData } from "@/types/dashboard";
import { TenantDashboardData } from "@/types/dashboard";
import { format } from "date-fns";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");
  console.log("session", session);

  // Default filters
  const now = new Date();
  const defaultViewMode = "year";
  const defaultSelectedDate = format(now, "yyyy");
  const defaultSelectedProperty = "";

  // Build params for API call
  const params = new URLSearchParams();
  params.append("viewMode", defaultViewMode);
  params.append("selectedDate", defaultSelectedDate);
  const cookieStore = await cookies();
  if (defaultSelectedProperty) params.append("propertyId", defaultSelectedProperty);
  if (session.user.role) params.append("userRole", session.user.role);
  if (session.user.id) params.append("userId", session.user.id.toString());

  // If tenant, use the new endpoint
  if (session.user.role === "TENANT") {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/dashboard/tenant`, {
      cache: "no-store",
      headers: {
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    });

    if (!res.ok) {
      // signOut();
      return (
        <Layout>
          <div className='text-red-600 p-4'>Failed to fetch tenant dashboard data.</div>
        </Layout>
      );
    }
    const tenantDashboardData: TenantDashboardData = await res.json();

    return (
      <Layout showBreadcrumbs={false}>
        <TenantDashboard tenantDashboardData={tenantDashboardData} />
      </Layout>
    );
  }

  // Default: landlord/admin dashboard
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/dashboard?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <Layout>
        <div className='text-red-600 p-4'>Failed to fetch dashboard data.</div>
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
