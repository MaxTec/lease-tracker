import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import List from "./List";
import Layout from "@/components/layout/Layout";
import { Lease } from "@/types/lease";
import { isMobileDevice } from "@/utils/device-detection";

export default async function LeasesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");
  if (session.user.role === "TENANT") redirect("/");

  const params = new URLSearchParams();
  if (session.user.role) params.append("userRole", session.user.role);
  if (session.user.id) params.append("userId", session.user.id.toString());
  const isMobile = await isMobileDevice();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ""}/api/leases?${params.toString()}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    return (
      <Layout>
        <div className="text-red-600 p-4">Failed to fetch leases.</div>
      </Layout>
    );
  }
  const leases: Lease[] = await res.json();

  return (
    <Layout>
      <List leases={leases} session={session} isMobile={isMobile} />
    </Layout>
  );
}
