import { notFound } from "next/navigation";
import TicketDetails from "@/components/tickets/TicketDetails";
import Layout from "@/components/layout/Layout";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export default async function TicketPage({ params }: Props) {
  const { id, locale } = await params;
  const t = await getTranslations({
    locale: locale,
    namespace: "tickets",
  });
  const cookieStore = await cookies();
  // Fetch ticket data from API
  console.log("Fetching ticket data from API", id, locale);
  console.log(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/tickets/${id}`);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ""}/api/tickets/${id}`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    }
  );

  // if (!res.ok) {
  //   notFound();
  // }

  const ticket = await res.json();

  console.log("ticket", ticket);

  // Fetch user session and extract role
  const session = await getServerSession(authOptions); // Replace with your session method if needed
  const userRole = session?.user?.role || "TENANT";
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("details")}</h1>
        <TicketDetails ticket={ticket} userRole={userRole} />
      </div>
    </Layout>
  );
}
