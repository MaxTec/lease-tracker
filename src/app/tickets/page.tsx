import { Suspense } from "react";
import TicketsList from "@/components/tickets/TicketsList";
import CreateTicketButton from "@/components/tickets/CreateTicketButton";
import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
export const metadata: Metadata = {
  title: "Support Tickets | Lease Tracker",
  description: "View and manage your support tickets",
};

export default function TicketsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <CreateTicketButton />
        </div>

        <Suspense fallback={<div>Loading tickets...</div>}>
          <TicketsList />
        </Suspense>
      </div>
    </Layout>
  );
}
