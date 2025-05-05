import { Suspense } from "react";
import TicketsList from "@/components/tickets/TicketsList";
import CreateTicketButton from "@/components/tickets/CreateTicketButton";
import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import { useTranslations } from "next-intl";
import LoadingSpinner from "@/components/ui/LoadingSpinner"
export const metadata: Metadata = {
  title: "Support Tickets | Lease Tracker",
  description: "View and manage your support tickets",
};

export default function TicketsPage() {
  const t = useTranslations();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t("tickets.title")}</h1>
          <CreateTicketButton />
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <TicketsList />
        </Suspense>
      </div>
    </Layout>
  );
}
