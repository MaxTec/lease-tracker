import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import List from "./List";
import Layout from "@/components/layout/Layout";
import { Ticket } from "@/types/ticket";

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/");
  if (session.user.role === "TENANT") redirect("/");

  const params = new URLSearchParams();
  if (session.user.role) params.append("userRole", session.user.role);
  if (session.user.id) params.append("userId", session.user.id.toString());

  const res = await fetch(`${process.env.NEXTAUTH_URL || ""}/api/tickets?${params.toString()}`, { cache: "no-store" });
  console.log('res', res);
  if (!res.ok) {
    return (
      <Layout>
        <div className="text-red-600 p-4">Failed to fetch tickets.</div>
      </Layout>
    );
  }
  const tickets: Ticket[] = await res.json();

  return (
    <Layout>
      <List tickets={tickets} session={session} />
    </Layout>
  );
}
