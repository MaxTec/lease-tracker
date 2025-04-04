"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tenant } from "@/types/tenant";
import { TenantFormData } from "@/types/tenant";

interface TenantFormProps {
  tenantId?: number;
  onClose: () => void;
  onSuccess: (tenant: Tenant) => void;
}

// Define the Zod schema for validation
const tenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  emergencyContact: z.string().optional(),
});

export default function TenantForm({
  tenantId,
  onClose,
  onSuccess,
}: TenantFormProps) {
  // const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TenantFormData>({
    // @ts-expect-error - Zod resolver is not typed
    resolver: zodResolver(tenantSchema), // Use Zod for validation
  });

  useEffect(() => {
    const fetchTenant = async () => {
      if (!tenantId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/tenants/${tenantId}`);
        if (!response.ok) throw new Error("Failed to fetch tenant");
        const data = await response.json();
        setValue("name", data.user.name);
        setValue("email", data.user.email);
        setValue("phone", data.phone);
        setValue("emergencyContact", data.emergencyContact || "");
      } catch (err) {
        console.error("Error fetching tenant:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch tenant");
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [tenantId, setValue]);

  const onSubmit = async (data: TenantFormData) => {
    setError(null);
    setLoading(true);
    console.log(data);
    try {
      const url = tenantId ? `/api/tenants/${tenantId}` : "/api/tenants";
      const method = tenantId ? "PUT" : "POST";
      console.log(url, method);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        const errorData = errorText
          ? JSON.parse(errorText)
          : { message: "Failed to save tenant" };
        console.log(errorData);
        throw new Error(errorData.message || "Failed to save tenant");
      }

      const result = await response.json();
      onSuccess(result);
      onClose();
    } catch (err) {
      console.error("Error saving tenant:", err);
      setError(err instanceof Error ? err.message : "Failed to save tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      )}

      <div>
        <Input
          {...register("name")}
          label="Name"
          error={errors.name?.message}
        />
      </div>

      <div>
        <Input
          {...register("email")}
          label="Email"
          type="email"
          error={errors.email?.message}
        />
      </div>
      <div>
        <Input
          {...register("phone")}
          label="Phone"
          error={errors.phone?.message}
        />
      </div>

      <div>
        <Input
          {...register("emergencyContact")}
          label="Emergency Contact"
          error={errors.emergencyContact?.message}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : tenantId ? "Update Tenant" : "Add Tenant"}
        </Button>
      </div>
    </form>
  );
}
