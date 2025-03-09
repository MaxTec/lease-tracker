"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header, Footer } from "@/components/layout";
import AdminPaymentList from "@/components/admin/AdminPaymentList";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user?.role) {
    return null; // Will redirect in useEffect
  }

  if (session.user.role !== "ADMIN") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Payment Management</h2>
            <p className="mb-6">Manage all payments and vouchers. Update payment statuses and send payment reminders.</p>

            <AdminPaymentList />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
