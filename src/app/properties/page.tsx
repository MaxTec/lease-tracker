"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import { FaPlus, FaBuilding } from "react-icons/fa";
import PropertyForm from "@/components/properties/PropertyForm";
import { Property } from "@/types/property";

export default function PropertiesPage() {
  const { data: session, status: authStatus } = useSession();
  // const router = useRouter();
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
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();
        setProperties(data);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch properties"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleEditProperty = (propertyId: number) => {
    setSelectedProperty(propertyId);
    setIsModalOpen(true);
  };

  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete property");

      setProperties(properties.filter((p) => p.id !== propertyId));
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property");
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
      label: "Property Name",
      render: (property: Property) => property.name,
    },
    {
      key: "address",
      label: "Address",
      render: (property: Property) => property.address,
    },
    {
      key: "type",
      label: "Type",
      render: (property: Property) => property.type,
    },
    {
      key: "units",
      label: "Units",
      render: (property: Property) => property.units.length,
    },
    {
      key: "actions",
      label: "Actions",
      render: (property: Property) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditProperty(property.id)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteProperty(property.id)}
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
              <h2 className="text-2xl font-semibold text-gray-800">
                Properties
              </h2>
              <Button
                onClick={() => {
                  setSelectedProperty(null);
                  setIsModalOpen(true);
                }}
              >
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">Add New Property</span>
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
                title="No Properties Found"
                description="There are no properties in the system yet. Click the button below to add your first property."
                actionLabel="Add New Property"
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
