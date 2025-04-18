"use client";

import { useState, useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tenant } from "@/types/tenant";
import { TenantFormData } from "@/types/tenant";
import { useTranslations } from "next-intl";

interface TenantFormProps {
  tenantId?: number;
  onClose: () => void;
  onSuccess: (tenant: Tenant) => void;
}

export default function TenantForm({
  tenantId,
  onClose,
  onSuccess,
}: TenantFormProps) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Define the Zod schema for validation with translations
  const getTenantSchema = () => z.object({
    name: z.string().min(1, t("common.errors.required")),
    email: z.string().email(t("common.errors.invalidEmail")),
    phone: z.string().min(1, t("common.errors.required")),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    employmentInfo: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(getTenantSchema()) as Resolver<TenantFormData>,
  });

  useEffect(() => {
    const fetchTenant = async () => {
      if (!tenantId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/tenants/${tenantId}`);
        if (!response.ok) throw new Error(t("tenants.errors.fetchFailed"));
        const data = await response.json();
        setValue("name", data.user.name);
        setValue("email", data.user.email);
        setValue("phone", data.phone);
        setValue("emergencyContact", data.emergencyContact || "");
        setValue("emergencyPhone", data.emergencyPhone || "");
        setValue("employmentInfo", data.employmentInfo || "");
      } catch (err) {
        console.error("Error fetching tenant:", err);
        setError(err instanceof Error ? err.message : t("tenants.errors.fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [tenantId, setValue, t]);

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
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || t("tenants.errors.saveFailed"));
      }
      onSuccess(result);
      onClose();
    } catch (err) {
      console.error("Error saving tenant:", err);
      setError(err instanceof Error ? err.message : t("tenants.errors.saveFailed"));
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
          label={t("tenants.form.name")}
          error={errors.name?.message}
        />
      </div>

      <div>
        <Input
          {...register("email")}
          label={t("tenants.form.email")}
          type="email"
          error={errors.email?.message}
        />
      </div>
      <div>
        <Input
          {...register("phone")}
          label={t("tenants.form.phone")}
          error={errors.phone?.message}
        />
      </div>

      <div>
        <Input
          {...register("emergencyContact")}
          label={t("tenants.form.emergencyContact")}
          error={errors.emergencyContact?.message}
        />
      </div>

      <div>
        <Input
          {...register("emergencyPhone")}
          label={t("tenants.form.emergencyPhone")}
          error={errors.emergencyPhone?.message}
        />
      </div>

      <div>
        <Input
          {...register("employmentInfo")}
          label={t("tenants.form.employmentInfo")}
          error={errors.employmentInfo?.message}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("common.buttons.cancel")}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? t("tenants.form.saving")
            : tenantId
            ? t("tenants.form.updateTenant")
            : t("tenants.form.createTenant")}
        </Button>
      </div>
    </form>
  );
}
