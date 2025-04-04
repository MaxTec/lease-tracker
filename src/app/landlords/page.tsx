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

export default function LandlordsPage() {
  const { data: session, status: authStatus } = useSession();
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLandlord, setCurrentLandlord] = useState<Landlord | null>(null);

  // Redirect if not admin
  if (authStatus === "authenticated" && session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  useEffect(() => {
    const fetchLandlords = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/landlords");
        if (!response.ok) throw new Error("Failed to fetch landlords");
        const data = await response.json();
        setLandlords(data);
      } catch (err) {
        console.error("Error fetching landlords:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch landlords"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLandlords();
  }, []);

  const handleEditLandlord = (landlord: Landlord) => {
    setCurrentLandlord(landlord);
    setIsModalOpen(true);
  };

  const handleDeleteLandlord = async (landlordId: number) => {
    if (!confirm("Are you sure you want to delete this landlord?")) return;

    try {
      const response = await fetch(`/api/landlords/${landlordId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete landlord");

      setLandlords(landlords.filter((l) => l.id !== landlordId));
    } catch (err) {
      console.error("Error deleting landlord:", err);
      alert("Failed to delete landlord");
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
      key: "name",
      label: "Name",
      render: (landlord: Landlord) => landlord.user.name,
    },
    {
      key: "email",
      label: "Email",
      render: (landlord: Landlord) => landlord.user.email,
    },
    {
      key: "phone",
      label: "Phone",
      render: (landlord: Landlord) => landlord.phone,
    },
    {
      key: "companyName",
      label: "Company",
      render: (landlord: Landlord) => landlord.companyName || "N/A",
    },
    {
      key: "address",
      label: "Address",
      render: (landlord: Landlord) => landlord.address,
    },
    {
      key: "actions",
      label: "Actions",
      render: (landlord: Landlord) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditLandlord(landlord)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteLandlord(landlord.id)}
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
                Landlords
              </h2>
              <Button onClick={handleAddLandlord}>
                <FaPlus className="mr-2 inline-block align-middle" />
                <span className="align-middle">Add New Landlord</span>
              </Button>
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
                title="No Landlords Found"
                description="There are no landlords in the system yet. Click the button below to add your first landlord."
                actionLabel="Add New Landlord"
                onAction={handleAddLandlord}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        title={currentLandlord ? "Edit Landlord" : "Add New Landlord"}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      >
        <LandlordForm
          landlordId={currentLandlord?.id}
          onClose={handleModalClose}
          onSuccess={handleUpdateLandlords}
        />
      </Modal>
    </Layout>
  );
}
