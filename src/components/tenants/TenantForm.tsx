"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface TenantFormData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  emergencyContact: string;
}

interface TenantFormProps {
  tenantId?: number;
}

// Define the Zod schema for validation
const tenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  emergencyContact: z.string().optional(),
});

export default function TenantForm({ tenantId }: TenantFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TenantFormData>({
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

    try {
      const url = tenantId ? `/api/tenants/${tenantId}` : "/api/tenants";
      const method = tenantId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save tenant");
      }

      router.push("/tenants");
    } catch (err) {
      console.error("Error saving tenant:", err);
      setError(err instanceof Error ? err.message : "Failed to save tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {error && <div className='bg-red-50 text-red-600 p-4 rounded-md'>{error}</div>}

      <div>
        <Input {...register("name")} label='Name' error={errors.name?.message} />
        {/* {errors.name && <span className='text-red-600'>{errors.name.message}</span>} */}
      </div>

      <div>
        <Input {...register("email")} label='Email' type='email' error={errors.email?.message} />
        {/* {errors.email && <span className='text-red-600'>{errors.email.message}</span>} */}
      </div>

      <div>
        {!tenantId && <Input {...register("password")} label='Password' type='password' error={errors.password?.message} />}
        {/* {errors.password && <span className='text-red-600'>{errors.password.message}</span>} */}
      </div>

      <div>
        <Input {...register("phone")} label='Phone' error={errors.phone?.message} />
        {/* {errors.phone && <span className='text-red-600'>{errors.phone.message}</span>} */}
      </div>

      <div>
        <Input {...register("emergencyContact")} label='Emergency Contact' error={errors.emergencyContact?.message} />
        {/* {errors.emergencyContact && <span className='text-red-600'>{errors.emergencyContact.message}</span>} */}
      </div>

      <div className='flex justify-end space-x-3'>
        <Button type='button' variant='outline' onClick={() => router.push("/tenants")}>
          Cancel
        </Button>
        <Button type='submit' disabled={loading}>
          {loading ? "Saving..." : tenantId ? "Update Tenant" : "Add Tenant"}
        </Button>
      </div>
    </form>
  );
}
