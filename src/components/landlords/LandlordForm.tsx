"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Landlord, LandlordFormData } from "@/types/landlord";
import { useTranslations } from "next-intl";

interface LandlordFormProps {
  landlordId?: number;
  onClose: () => void;
  onSuccess: (landlord: Landlord) => void;
}

export default function LandlordForm({ landlordId, onClose, onSuccess }: LandlordFormProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<LandlordFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    companyName: "",
  });

  // Define schema with translations
  const getLandlordSchema = () => z.object({
    name: z.string().min(1, t("common.errors.required")),
    email: z.string().email(t("common.errors.invalidEmail")),
    password: z.string().min(6, t("common.errors.minimumLength", { length: '6' })).optional(),
    phone: z.string().min(1, t("common.errors.required")),
    address: z.string().min(1, t("common.errors.required")),
    companyName: z.string().optional(),
  });

  useEffect(() => {
    const fetchLandlord = async () => {
      if (!landlordId) return;

      try {
        const response = await fetch(`/api/landlords/${landlordId}`);
        if (!response.ok) {
          throw new Error(t("landlords.errors.fetchFailed"));
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
        setErrors({ submit: t("landlords.errors.fetchFailed") });
      }
    };

    fetchLandlord();
  }, [landlordId, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formDataObj = new FormData(e.currentTarget);
    const data = Object.fromEntries(formDataObj.entries());

    try {
      const validatedData = getLandlordSchema().parse(data);
      
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
        throw new Error(error.message || (landlordId ? t("landlords.errors.updateFailed") : t("landlords.errors.createFailed")));
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
        setErrors({ 
          submit: landlordId ? t("landlords.errors.updateFailed") : t("landlords.errors.createFailed") 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t("landlords.form.name")}
        name="name"
        type="text"
        defaultValue={formData.name}
        error={errors.name}
        required
      />
      <Input
        label={t("landlords.form.email")}
        name="email"
        type="email"
        defaultValue={formData.email}
        error={errors.email}
        required
      />
      {!landlordId && (
        <Input
          label={t("landlords.form.password")}
          name="password"
          type="password"
          error={errors.password}
          required
        />
      )}
      <Input
        label={t("landlords.form.phone")}
        name="phone"
        type="tel"
        defaultValue={formData.phone}
        error={errors.phone}
        required
      />
      <Input
        label={t("landlords.form.address")}
        name="address"
        type="text"
        defaultValue={formData.address}
        error={errors.address}
        required
      />
      <Input
        label={t("landlords.form.companyName")}
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
          {t("common.buttons.cancel")}
        </Button>
        <Button type="submit" isLoading={loading}>
          {landlordId ? t("landlords.form.update") : t("landlords.form.create")}
        </Button>
      </div>
    </form>
  );
} 