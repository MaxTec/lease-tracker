import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import List from "./List";
import Layout from "@/components/layout/Layout";
import { Property } from "@/types/property";
import { isMobileDevice } from "@/utils/device-detection";
export default async function PropertiesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");
  if (session.user.role === "TENANT") redirect("/");
  const isMobile = await isMobileDevice();

  const params = new URLSearchParams();
  if (session.user.role) params.append("userRole", session.user.role);
  if (session.user.id) params.append("userId", session.user.id.toString());
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL || ""
    }/api/properties?${params.toString()}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    // Optionally handle error, for now just pass empty array
    return (
      <Layout>
        <div className="text-red-600 p-4">Failed to fetch properties.</div>
      </Layout>
    );
  }
  const properties: Property[] = await res.json();
  return (
    <Layout>
      <List properties={properties} session={session} isMobile={isMobile} />
    </Layout>
  );
}
