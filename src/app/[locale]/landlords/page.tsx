import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import List from "./List";
import Layout from "@/components/layout/Layout";
import { Landlord } from "@/types/landlord";

export default async function LandlordsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") redirect("/");

  const params = new URLSearchParams();
  if (session.user.role) params.append("userRole", session.user.role);
  if (session.user.id) params.append("userId", session.user.id.toString());

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/landlords?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <Layout>
        <div className="text-red-600 p-4">Failed to fetch landlords.</div>
      </Layout>
    );
  }
  const landlords: Landlord[] = await res.json();

  return (
    <Layout>
      <List landlords={landlords} session={session} />
    </Layout>
  );
}
