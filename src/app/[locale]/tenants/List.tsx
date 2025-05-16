"use client";

import { useState, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaUsers } from "react-icons/fa";
import TenantForm from "@/components/tenants/TenantForm";
import Modal from "@/components/ui/Modal";
import PopConfirm from "@/components/ui/PopConfirm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Tenant } from "@/types/tenant";
import { useTranslations } from "next-intl";
import { Session } from "next-auth";
import { useDevice } from "@/contexts/DeviceContext";

interface ListProps {
  tenants: Tenant[];
  session: Session;
}

const List = ({ tenants: initialTenants, session }: ListProps) => {
  const t = useTranslations();
  const { isMobile } = useDevice();
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<number | null>(null);
  console.log("session:tenats", session);

  const handleEditTenant = useCallback((tenant: Tenant) => {
    setCurrentTenant(tenant);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((tenantId: number) => {
    setTenantToDelete(tenantId);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!tenantToDelete) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/tenants/${tenantToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(t("tenants.errors.deleteFailed"));
      setTenants((prev) => prev.filter((t) => t.id !== tenantToDelete));
      setIsDeleteConfirmOpen(false);
      setTenantToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("tenants.errors.deleteFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [tenantToDelete, t]);

  const handleAddTenant = useCallback(() => {
    setCurrentTenant(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setCurrentTenant(null);
  }, []);

  const handleUpdateTenants = useCallback((updatedTenant: Tenant) => {
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
  }, []);

  const columns = useMemo(
    () => [
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
              aria-label={t("common.buttons.edit")}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleEditTenant(tenant);
              }}
            >
              {t("common.buttons.edit")}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDeleteClick(tenant.id)}
              aria-label={t("common.buttons.delete")}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleDeleteClick(tenant.id);
              }}
            >
              {t("common.buttons.delete")}
            </Button>
          </div>
        ),
      },
    ],
    [t, handleEditTenant, handleDeleteClick, isMobile]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <LoadingSpinner size="lg" color="indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md" role="alert">{error}</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800" tabIndex={0} aria-label={t("tenants.title")}>{t("tenants.title")}</h2>
            {tenants.length > 0 && (
              <Button
                onClick={handleAddTenant}
                aria-label={t("tenants.create")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleAddTenant();
                }}
              >
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
      <Modal
        title={currentTenant ? t("tenants.edit") : t("tenants.create")}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      >
        <TenantForm
          tenantId={currentTenant?.id}
          onClose={handleModalClose}
          onSuccess={handleUpdateTenants}
          session={session}
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
    </div>
  );
};

export default List; 