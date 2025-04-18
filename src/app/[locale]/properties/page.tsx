"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaBuilding } from "react-icons/fa";
import PropertyForm from "@/components/properties/PropertyForm";
import { Property } from "@/types/property";
import { useTranslations } from "next-intl";

export default function PropertiesPage() {
  const t = useTranslations();
  const { data: session, status: authStatus } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  // Redirect if not admin
  if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/properties");
        if (!response.ok) throw new Error(t("properties.errors.fetchFailed"));
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(
          err instanceof Error ? err.message : t("properties.errors.fetchFailed")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [t]);

  const handleEditProperty = (propertyId: number) => {
    setSelectedProperty(propertyId);
    setIsModalOpen(true);
  };

  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm(t("properties.confirmDelete"))) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(t("properties.errors.deleteFailed"));

      setProperties(properties.filter((p) => p.id !== propertyId));
    } catch (err) {
      console.error("Error deleting property:", err);
      alert(t("properties.errors.deleteFailed"));
    }
  };

  const handleUpdateProperties = (updatedProperty: Property) => {
    setProperties((prevProperties) => {
      const existingPropertyIndex = prevProperties.findIndex(
        (p) => p.id === updatedProperty.id
      );
      if (existingPropertyIndex > -1) {
        // Update existing property
        const updatedProperties = [...prevProperties];
        updatedProperties[existingPropertyIndex] = updatedProperty;
        return updatedProperties;
      }
      // Add new property
      return [...prevProperties, updatedProperty];
    });
  };

  const columns = [
    {
      key: "name",
      label: t("properties.form.name"),
      render: (property: Property) => property.name,
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
      render: (property: Property) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditProperty(property.id)}
          >
            {t("common.buttons.edit")}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteProperty(property.id)}
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
              <h2 className="text-2xl font-semibold text-gray-800">
                {t("properties.title")}
              </h2>
              <Button
                onClick={() => {
                  setSelectedProperty(null);
                  setIsModalOpen(true);
                }}
              >
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">{t("properties.create")}</span>
              </Button>
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
      </div>
      <PropertyForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyId={selectedProperty ?? undefined}
        onUpdate={handleUpdateProperties}
      />
    </Layout>
  );
}
