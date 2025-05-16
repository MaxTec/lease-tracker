"use client";

import { useState, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaUserTie } from "react-icons/fa";
import LandlordForm from "@/components/landlords/LandlordForm";
import Modal from "@/components/ui/Modal";
import PopConfirm from "@/components/ui/PopConfirm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Landlord } from "@/types/landlord";
import { useTranslations } from "next-intl";
import { Session } from "next-auth";

interface ListProps {
  landlords: Landlord[];
  session: Session;
  isMobile: boolean;
}

const List = ({ landlords: initialLandlords, isMobile }: ListProps) => {
  const t = useTranslations();
  const [landlords, setLandlords] = useState<Landlord[]>(initialLandlords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLandlord, setCurrentLandlord] = useState<Landlord | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [landlordToDelete, setLandlordToDelete] = useState<number | null>(null);

  const handleEditLandlord = useCallback((landlord: Landlord) => {
    setCurrentLandlord(landlord);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((landlordId: number) => {
    setLandlordToDelete(landlordId);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!landlordToDelete) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/landlords/${landlordToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(t("landlords.errors.deleteFailed"));
      setLandlords((prev) => prev.filter((l) => l.id !== landlordToDelete));
      setIsDeleteConfirmOpen(false);
      setLandlordToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("landlords.errors.deleteFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [landlordToDelete, t]);

  const handleAddLandlord = useCallback(() => {
    setCurrentLandlord(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setCurrentLandlord(null);
  }, []);

  const handleUpdateLandlords = useCallback((updatedLandlord: Landlord) => {
    setLandlords((prevLandlords) => {
      const existingLandlordIndex = prevLandlords.findIndex(
        (l) => l.id === updatedLandlord.id
      );
      if (existingLandlordIndex > -1) {
        const updatedLandlords = [...prevLandlords];
        updatedLandlords[existingLandlordIndex] = updatedLandlord;
        return updatedLandlords;
      }
      return [...prevLandlords, updatedLandlord];
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "user.name",
        label: t("landlords.form.name"),
        render: (landlord: Landlord) => landlord.user.name,
        priority: isMobile ? 1 : undefined,
      },
      {
        key: "user.email",
        label: t("landlords.form.email"),
        render: (landlord: Landlord) => landlord.user.email,
        priority: isMobile ? 2 : undefined,
      },
      {
        key: "phone",
        label: t("landlords.form.phone"),
        render: (landlord: Landlord) => landlord.phone,
      },
      {
        key: "companyName",
        label: t("landlords.form.companyName"),
        render: (landlord: Landlord) => landlord.companyName || "N/A",
      },
      {
        key: "address",
        label: t("landlords.form.address"),
        render: (landlord: Landlord) => landlord.address,
      },
      {
        key: "actions",
        label: t("common.buttons.actions"),
        priority: isMobile ? 3 : undefined,
        render: (landlord: Landlord) => (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditLandlord(landlord)}
              aria-label={t("common.buttons.edit")}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleEditLandlord(landlord);
              }}
            >
              {t("common.buttons.edit")}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDeleteClick(landlord.id)}
              aria-label={t("common.buttons.delete")}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  handleDeleteClick(landlord.id);
              }}
            >
              {t("common.buttons.delete")}
            </Button>
          </div>
        ),
      },
    ],
    [t, handleEditLandlord, handleDeleteClick]
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
      <div className="bg-red-50 text-red-600 p-4 rounded-md" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2
              className="text-2xl font-semibold text-gray-800"
              tabIndex={0}
              aria-label={t("landlords.title")}
            >
              {t("landlords.title")}
            </h2>
            {landlords.length > 0 && (
              <Button
                onClick={handleAddLandlord}
                aria-label={t("landlords.create")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleAddLandlord();
                }}
              >
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">{t("landlords.create")}</span>
              </Button>
            )}
          </div>

          {landlords.length > 0 ? (
            <Table
              data={landlords}
              columns={columns}
              searchable={true}
              searchKeys={["user.name", "user.email", "phone", "companyName"]}
              pageSize={10}
            />
          ) : (
            <EmptyState
              icon={<FaUserTie className="w-12 h-12" />}
              title={t("landlords.emptyState.title")}
              description={t("landlords.emptyState.description")}
              actionLabel={t("landlords.create")}
              onAction={handleAddLandlord}
            />
          )}
        </div>
      </div>
      <Modal
        title={currentLandlord ? t("landlords.edit") : t("landlords.create")}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      >
        <LandlordForm
          landlordId={currentLandlord?.id}
          onClose={handleModalClose}
          onSuccess={handleUpdateLandlords}
        />
      </Modal>
      <PopConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t("landlords.deleteConfirm.title")}
        confirmText={t("landlords.deleteConfirm.confirm")}
        cancelText={t("landlords.deleteConfirm.cancel")}
      >
        <p className="text-gray-600">{t("landlords.confirmDelete")}</p>
      </PopConfirm>
    </div>
  );
};

export default List;
