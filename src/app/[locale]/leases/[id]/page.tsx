import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LeaseItem from "./LeaseItem";
import Layout from "@/components/layout/Layout";

export default async function LeaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role === "TENANT") redirect("/");

  const leaseId = id;

  // Fetch lease data
  const leaseRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/leases/${leaseId}`, { cache: "no-store" });
  if (!leaseRes.ok) {
    return (
      <Layout>
        <div className="text-red-600 p-4">Failed to fetch lease information.</div>
      </Layout>
    );
  }
  const lease = await leaseRes.json();

  // Fetch payments data
  const paymentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/payments?leaseId=${leaseId}`, { cache: "no-store" });
  if (!paymentsRes.ok) {
    return (
      <Layout>
        <div className="text-red-600 p-4">Failed to fetch payments.</div>
      </Layout>
    );
  }
  const payments = await paymentsRes.json();

  return (
    <Layout>
      <LeaseItem lease={lease} payments={payments} />
    </Layout>
  );
}
