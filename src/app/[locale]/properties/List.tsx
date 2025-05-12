"use client";

import { useState, useMemo, useCallback } from "react";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaBuilding } from "react-icons/fa";
import PropertyForm from "@/components/properties/PropertyForm";
import PopConfirm from "@/components/ui/PopConfirm";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Property } from "@/types/property";
import { useTranslations } from "next-intl";
import { Session } from "next-auth";

interface ListProps {
  properties: Property[];
  session: Session;
}

const List = ({ properties: initialProperties }: ListProps) => {
  const t = useTranslations();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);

  const handleEditProperty = useCallback((propertyId: number) => {
    setSelectedProperty(propertyId);
    setIsModalOpen(true);
  }, []);

  const handleDeleteProperty = useCallback((propertyId: number) => {
    setPropertyToDelete(propertyId);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!propertyToDelete) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/properties/${propertyToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(t("properties.errors.deleteFailed"));
      setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete));
      setDeleteConfirmOpen(false);
      setPropertyToDelete(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("properties.errors.deleteFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [propertyToDelete, t]);

  const handleUpdateProperties = useCallback((updatedProperty: Property) => {
    if (!updatedProperty) return;
    setProperties((prevProperties) => {
      const existingPropertyIndex = prevProperties.findIndex(
        (p) => p.id === updatedProperty.id
      );
      if (existingPropertyIndex > -1) {
        // Update existing property
        const updatedPropertiesList = [...prevProperties];
        updatedPropertiesList[existingPropertyIndex] = updatedProperty;
        return updatedPropertiesList;
      }
      // Add new property
      return [...prevProperties, updatedProperty];
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: t("properties.form.name"),
        render: (property: Property) => property.name,
        priority: 1,
      },
      {
        key: "address",
        label: t("properties.form.address"),
        render: (property: Property) => property.address,
      },
      {
        key: "type",
        label: t("properties.form.type"),
        render: (property: Property) => property.type,
      },
      {
        key: "units",
        label: t("properties.form.totalUnits"),
        render: (property: Property) => property.units.length,
      },
      {
        key: "actions",
        label: t("common.buttons.actions"),
        priority: 3,
        render: (property: Property) => (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditProperty(property.id as number)}
              aria-label={t("common.buttons.edit")}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleEditProperty(property.id as number);
              }}
            >
              {t("common.buttons.edit")}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDeleteProperty(property.id as number)}
              aria-label={t("common.buttons.delete")}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleDeleteProperty(property.id as number);
              }}
            >
              {t("common.buttons.delete")}
            </Button>
          </div>
        ),
      },
    ],
    [t, handleEditProperty, handleDeleteProperty]
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
            <h2 className="text-2xl font-semibold text-gray-800" tabIndex={0} aria-label={t("properties.title")}>{t("properties.title")}</h2>
            {properties.length > 0 && (
              <Button
                onClick={() => {
                  setSelectedProperty(null);
                  setIsModalOpen(true);
                }}
                aria-label={t("properties.create")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedProperty(null);
                    setIsModalOpen(true);
                  }
                }}
              >
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">{t("properties.create")}</span>
              </Button>
            )}
          </div>

          {properties.length > 0 ? (
            <Table
              data={properties}
              columns={columns}
              searchable={true}
              searchKeys={["name", "address", "type"]}
              pageSize={10}
            />
          ) : (
            <EmptyState
              icon={<FaBuilding className="w-12 h-12" />}
              title={t("properties.emptyState.title")}
              description={t("properties.emptyState.description")}
              actionLabel={t("properties.create")}
              onAction={() => {
                setSelectedProperty(null);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProperty ? t("properties.edit") : t("properties.create")}
      >
        <PropertyForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyId={selectedProperty ?? undefined}
          onUpdate={handleUpdateProperties}
        />
      </Modal>
      <PopConfirm
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("properties.deleteConfirm.title")}
        confirmText={t("properties.deleteConfirm.confirm")}
        cancelText={t("properties.deleteConfirm.cancel")}
      >
        <p className="text-gray-600">{t("properties.confirmDelete")}</p>
      </PopConfirm>
    </div>
  );
};

export default List; 