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
import PopConfirm from "@/components/ui/PopConfirm";
import { useDevice } from "@/contexts/DeviceContext";
import { Tenant } from "@/types/tenant";
import { useTranslations } from "next-intl";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function TenantsPage() {
  const t = useTranslations();
  const { data: session, status: authStatus } = useSession();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<number | null>(null);
  const { isMobile } = useDevice();
  // Redirect if not admin
  if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/tenants");
        if (!response.ok) throw new Error(t("tenants.errors.fetchFailed"));
        const data = await response.json();
        setTenants(data);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        setError(
          err instanceof Error ? err.message : t("tenants.errors.fetchFailed")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [t]);

  const handleEditTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (tenantId: number) => {
    setTenantToDelete(tenantId);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;

    try {
      const response = await fetch(`/api/tenants/${tenantToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(t("tenants.errors.deleteFailed"));

      setTenants(tenants.filter((t) => t.id !== tenantToDelete));
    } catch (err) {
      console.error("Error deleting tenant:", err);
      alert(t("tenants.errors.deleteFailed"));
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
      const existingTenantIndex = prevTenants.findIndex(
        (t) => t.id === updatedTenant.id
      );
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
      key: "user.name",
      label: t("tenants.form.name"),
      render: (tenant: Tenant) => tenant.user.name,
      priority: 1,
    },
    {
      key: "user.email",
      label: t("tenants.form.email"),
      render: (tenant: Tenant) => tenant.user.email,
    },
    {
      key: "phone",
      label: t("tenants.form.phone"),
      render: (tenant: Tenant) => tenant.phone,
    },
    {
      key: "emergencyContact",
      label: t("tenants.form.emergencyContact"),
      render: (tenant: Tenant) => tenant.emergencyContact || "N/A",
    },
    {
      key: "actions",
      label: t("common.buttons.actions"),
      priority: isMobile ? 1 : 0,
      sticky: isMobile ? true : false,
      width: isMobile ? "100px" : "100px",
      render: (tenant: Tenant) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditTenant(tenant)}
          >
            {t("common.buttons.edit")}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteClick(tenant.id)}
          >
            {t("common.buttons.delete")}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[500px]">
          <LoadingSpinner size="lg" color="indigo-600" />
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
              <h2 className="text-2xl font-semibold text-gray-800">
                {t("tenants.title")}
              </h2>
              {tenants.length > 0 && (
                <Button onClick={handleAddTenant}>
                  <FaPlus className="mr-2 inline-block align-middle" />
                  <span className="align-middle">{t("tenants.create")}</span>
                </Button>
              )}
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
                title={t("tenants.emptyState.title")}
                description={t("tenants.emptyState.description")}
                actionLabel={t("tenants.create")}
                onAction={handleAddTenant}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        title={currentTenant ? t("tenants.edit") : t("tenants.create")}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      >
        <TenantForm
          tenantId={currentTenant?.id}
          onClose={handleModalClose}
          onSuccess={handleUpdateTenants}
        />
      </Modal>

      <PopConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t("tenants.deleteConfirm.title")}
        confirmText={t("tenants.deleteConfirm.confirm")}
        cancelText={t("tenants.deleteConfirm.cancel")}
      >
        <p className="text-gray-600">{t("tenants.confirmDelete")}</p>
      </PopConfirm>
    </Layout>
  );
}
