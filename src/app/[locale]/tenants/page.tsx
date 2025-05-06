import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// @ts-expect-error: List will be created next
import List from "./List";
import Layout from "@/components/layout/Layout";
import { Tenant } from "@/types/tenant";

export default async function TenantsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");
  if (session.user.role === "TENANT") redirect("/");

  const params = new URLSearchParams();
  if (session.user.role) params.append("userRole", session.user.role);
  if (session.user.id) params.append("userId", session.user.id.toString());

  const res = await fetch(`${process.env.NEXTAUTH_URL || ""}/api/tenants?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <Layout>
        <div className="text-red-600 p-4">Failed to fetch tenants.</div>
      </Layout>
    );
  }
  const tenants: Tenant[] = await res.json();

  return (
    <Layout>
      <List tenants={tenants} session={session} />
    </Layout>
  );
}
