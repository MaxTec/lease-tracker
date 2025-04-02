"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Landlord, LandlordFormData } from "@/types/landlord";

const landlordSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  companyName: z.string().optional(),
});

interface LandlordFormProps {
  landlordId?: number;
  onClose: () => void;
  onSuccess: (landlord: Landlord) => void;
}

export default function LandlordForm({ landlordId, onClose, onSuccess }: LandlordFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<LandlordFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    companyName: "",
  });

  useEffect(() => {
    const fetchLandlord = async () => {
      if (!landlordId) return;

      try {
        const response = await fetch(`/api/landlords/${landlordId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch landlord");
        }

        const landlord: Landlord = await response.json();
        setFormData({
          name: landlord.user.name,
          email: landlord.user.email,
          phone: landlord.phone,
          address: landlord.address,
          companyName: landlord.companyName || "",
        });
      } catch (err) {
        console.error("Error fetching landlord:", err);
        setErrors({ submit: "Failed to fetch landlord" });
      }
    };

    fetchLandlord();
  }, [landlordId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formDataObj = new FormData(e.currentTarget);
    const data = Object.fromEntries(formDataObj.entries());

    try {
      const validatedData = landlordSchema.parse(data);
      
      const url = landlordId 
        ? `/api/landlords/${landlordId}`
        : "/api/landlords";
      
      const method = landlordId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${landlordId ? "update" : "create"} landlord`);
      }

      const landlord = await response.json();
      onSuccess(landlord);
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path) {
            fieldErrors[error.path[0]] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error(`Error ${landlordId ? "updating" : "creating"} landlord:`, err);
        setErrors({ submit: `Failed to ${landlordId ? "update" : "create"} landlord` });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        name="name"
        type="text"
        defaultValue={formData.name}
        error={errors.name}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        defaultValue={formData.email}
        error={errors.email}
      />
      {!landlordId && (
        <Input
          label="Password"
          name="password"
          type="password"
          error={errors.password}
        />
      )}
      <Input
        label="Phone"
        name="phone"
        type="tel"
        defaultValue={formData.phone}
        error={errors.phone}
      />
      <Input
        label="Address"
        name="address"
        type="text"
        defaultValue={formData.address}
        error={errors.address}
      />
      <Input
        label="Company Name"
        name="companyName"
        type="text"
        defaultValue={formData.companyName}
        error={errors.companyName}
      />

      {errors.submit && (
        <div className="text-red-500 text-sm">{errors.submit}</div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={loading}>
          {landlordId ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
} 