"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaUsers } from "react-icons/fa";
import TenantForm from "@/components/tenants/TenantForm";
import Modal from "@/components/ui/Modal";

interface Tenant {
  id: number;
  phone: string;
  emergencyContact: string | null;
  user: {
    name: string;
    email: string;
  };
}

export default function TenantsPage() {
  const { data: session, status: authStatus } = useSession();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  // Redirect if not admin
  if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/tenants");
        if (!response.ok) throw new Error("Failed to fetch tenants");
        const data = await response.json();
        setTenants(data);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch tenants"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleEditTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDeleteTenant = async (tenantId: number) => {
    if (!confirm("Are you sure you want to delete this tenant?")) return;

    try {
      const response = await fetch(`/api/tenants/${tenantId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete tenant");

      setTenants(tenants.filter((t) => t.id !== tenantId));
    } catch (err) {
      console.error("Error deleting tenant:", err);
      alert("Failed to delete tenant");
    }
  };

  const handleAddTenant = () => {
    setCurrentTenant(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentTenant(null);
  };

  const handleUpdateTenants = (updatedTenant: Tenant) => {
    setTenants((prevTenants) => {
      const existingTenantIndex = prevTenants.findIndex(t => t.id === updatedTenant.id);
      if (existingTenantIndex > -1) {
        // Update existing tenant
        const updatedTenants = [...prevTenants];
        updatedTenants[existingTenantIndex] = updatedTenant;
        return updatedTenants;
      }
      // Add new tenant
      return [...prevTenants, updatedTenant];
    });
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (tenant: Tenant) => tenant.user.name,
    },
    {
      key: "email",
      label: "Email",
      render: (tenant: Tenant) => tenant.user.email,
    },
    {
      key: "phone",
      label: "Phone",
      render: (tenant: Tenant) => tenant.phone,
    },
    {
      key: "emergencyContact",
      label: "Emergency Contact",
      render: (tenant: Tenant) => tenant.emergencyContact || "N/A",
    },
    {
      key: "actions",
      label: "Actions",
      render: (tenant: Tenant) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditTenant(tenant)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteTenant(tenant.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Tenants</h2>
              <Button onClick={handleAddTenant}>
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">Add New Tenant</span>
              </Button>
            </div>

            {tenants.length > 0 ? (
              <Table
                data={tenants}
                columns={columns}
                searchable={true}
                searchKeys={["user.name", "user.email", "phone"]}
                pageSize={10}
              />
            ) : (
              <EmptyState
                icon={<FaUsers className="w-12 h-12" />}
                title="No Tenants Found"
                description="There are no tenants in the system yet. Click the button below to add your first tenant."
                actionLabel="Add New Tenant"
                onAction={handleAddTenant}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        title="Add New Tenant"
        isOpen={isModalOpen}
        onClose={handleModalClose}
      >
        <TenantForm tenantId={currentTenant?.id} onClose={handleModalClose} onSuccess={handleUpdateTenants} />
      </Modal>
    </Layout>
  );
}
