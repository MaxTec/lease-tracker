"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaUserTie } from "react-icons/fa";
import LandlordForm from "@/components/landlords/LandlordForm";
import Modal from "@/components/ui/Modal";
import { Landlord } from "@/types/landlord";
import { useTranslations } from "next-intl";
import PopConfirm from "@/components/ui/PopConfirm";
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function LandlordsPage() {
  const t = useTranslations();
  const { data: session, status: authStatus } = useSession();
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLandlord, setCurrentLandlord] = useState<Landlord | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [landlordToDelete, setLandlordToDelete] = useState<number | null>(null);

  // Redirect if not admin
  if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  useEffect(() => {
    const fetchLandlords = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/landlords");
        if (!response.ok) throw new Error(t("landlords.errors.fetchFailed"));
        const data = await response.json();
        setLandlords(data);
      } catch (err) {
        console.error("Error fetching landlords:", err);
        setError(
          err instanceof Error ? err.message : t("landlords.errors.fetchFailed")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLandlords();
  }, [t]);

  const handleEditLandlord = (landlord: Landlord) => {
    setCurrentLandlord(landlord);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (landlordId: number) => {
    setLandlordToDelete(landlordId);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!landlordToDelete) return;
    try {
      const response = await fetch(`/api/landlords/${landlordToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(t("landlords.errors.deleteFailed"));
      setLandlords(landlords.filter((l) => l.id !== landlordToDelete));
    } catch (err) {
      console.error("Error deleting landlord:", err);
      alert(t("landlords.errors.deleteFailed"));
    } finally {
      setIsDeleteConfirmOpen(false);
      setLandlordToDelete(null);
    }
  };

  const handleAddLandlord = () => {
    setCurrentLandlord(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentLandlord(null);
  };

  const handleUpdateLandlords = (updatedLandlord: Landlord) => {
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
  };

  const columns = [
    {
      key: "user.name",
      label: t("landlords.form.name"),
      render: (landlord: Landlord) => landlord.user.name,
    },
    {
      key: "user.email",
      label: t("landlords.form.email"),
      render: (landlord: Landlord) => landlord.user.email,
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
      render: (landlord: Landlord) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditLandlord(landlord)}
          >
            {t("common.buttons.edit")}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteClick(landlord.id)}
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
                {t("landlords.title")}
              </h2>
              {landlords.length > 0 && (    
                <Button onClick={handleAddLandlord}>
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
    </Layout>
  );
}
