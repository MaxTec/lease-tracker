"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaTrash } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Fieldset from "@/components/ui/Fieldset";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useTranslations } from "next-intl";
import { Property } from "@/types/property";

// Form data structure
type PropertyFormData = {
  id?: number;
  name: string;
  address: string;
  type: string;
  landlordId?: string; // string for form, number for API
  units: Array<{
    unitNumber: string;
    bedrooms: string;
    bathrooms: string;
    squareFeet: string;
  }>;
};

interface Landlord {
  id: number;
  userId: number;
  user: {
    name: string;
    email: string;
  };
}

interface PropertyFormProps {
  propertyId?: number;
  isOpen?: boolean;
  onClose: () => void;
  onUpdate: (data: Property) => void;
}

export default function PropertyForm({
  propertyId,
  onClose,

  onUpdate,
}: PropertyFormProps) {
  const t = useTranslations();

  // Define the Zod schema for Property with translated error messages
  const getPropertySchema = () =>
    z.object({
      name: z.string().min(1, t("common.errors.required")),
      address: z.string().min(1, t("common.errors.required")),
      type: z.string().min(1, t("common.errors.required")),
      landlordId: z.string().optional(),
      units: z
        .array(
          z.object({
            unitNumber: z.string().min(1, t("common.errors.required")),
            bedrooms: z.string(),
            bathrooms: z.string(),
            squareFeet: z.string(),
          })
        )
        .min(1, t("properties.errors.atLeastOneUnit")),
    });

  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(getPropertySchema()),
    defaultValues: {
      name: "",
      address: "",
      type: "",
      landlordId: "",
      units: [{ unitNumber: "", bedrooms: "", bathrooms: "", squareFeet: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "units",
  });

  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch landlords
        setLoading(true);
        const landlordsRes = await fetch("/api/landlords");
        if (!landlordsRes.ok)
          throw new Error(t("landlords.errors.fetchFailed"));
        const landlordsData = await landlordsRes.json();
        setLandlords(landlordsData);

        if (!propertyId && session?.user?.role === "LANDLORD") {
          const myLandlord = landlordsData.find(
            (l: Landlord) => l.userId === Number(session.user.id)
          );
          if (myLandlord) {
            setValue("landlordId", String(myLandlord.id));
          }
        }

        // If editing, fetch property data
        if (propertyId) {
          const propertyRes = await fetch(`/api/properties/${propertyId}`);
          if (!propertyRes.ok)
            throw new Error(t("properties.errors.fetchFailed"));
          const propertyData = await propertyRes.json();

          // Convert numbers to strings for form data
          const formData: PropertyFormData = {
            id: propertyData.id,
            name: propertyData.name,
            address: propertyData.address,
            type: propertyData.type,
            landlordId: String(propertyData.landlordId),
            units: propertyData.units.map(
              (unit: {
                unitNumber: string;
                bedrooms: number;
                bathrooms: number;
                squareFeet: number;
              }) => ({
                unitNumber: unit.unitNumber,
                bedrooms: String(unit.bedrooms),
                bathrooms: String(unit.bathrooms),
                squareFeet: String(unit.squareFeet),
              })
            ),
          };

          reset(formData);
        }
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : "Failed to load form data"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId, append, reset, t, session, setValue]);

  const onSubmit = async (formData: PropertyFormData) => {
    console.log("formData", formData);
    setLoading(true);
    setFormError(null);

    try {
      // Convert string values to numbers for API
      const apiData = {
        ...formData,
        landlordId: formData.landlordId
          ? parseInt(formData.landlordId, 10)
          : undefined,
        units: formData.units.map((unit) => ({
          ...unit,
          bedrooms: parseInt(unit.bedrooms, 10) || 0,
          bathrooms: parseInt(unit.bathrooms, 10) || 0,
          squareFeet: parseInt(unit.squareFeet, 10) || 0,
        })),
      };

      const url = propertyId
        ? `/api/properties/${propertyId}`
        : "/api/properties";
      const method = propertyId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error(
          propertyId
            ? t("properties.errors.updateFailed")
            : t("properties.errors.createFailed")
        );
      }
      const responseData = await response.json();
      console.log("responseData", responseData);
      onUpdate(responseData);
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save property"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[250px]">
          <LoadingSpinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
              {formError}
            </div>
          )}

          <Input
            {...register("name")}
            label={t("properties.form.propertyName")}
            error={errors.name?.message}
            required
          />

          <Input
            {...register("address")}
            label={t("properties.form.address")}
            error={errors.address?.message}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              required
              {...register("type")}
              label={t("properties.form.propertyType")}
              options={[
                { value: "APARTMENT", label: t("properties.types.apartment") },
                { value: "HOUSE", label: t("properties.types.house") },
                {
                  value: "COMMERCIAL",
                  label: t("properties.types.commercial"),
                },
                { value: "OTHER", label: t("properties.types.other") },
              ]}
              error={errors.type?.message}
            />

            <Select
              {...register("landlordId")}
              label={t("properties.form.landlord")}
              disabled={
                landlords.length === 0 ||
                propertyId !== undefined ||
                session?.user?.role === "LANDLORD"
              }
              options={landlords.map((landlord) => ({
                value: String(landlord.id),
                label: landlord.user.name,
              }))}
              error={errors.landlordId?.message}
            />
          </div>

          <Fieldset legend={t("properties.form.units")}>
            {fields.map((unit, index) => (
              <div key={unit.id} className="flex space-x-4 mb-4 relative pr-20">
                <Input
                  required
                  {...register(`units.${index}.unitNumber`)}
                  label={t("properties.form.unitNumber")}
                  error={errors.units?.[index]?.unitNumber?.message}
                />
                <Input
                  {...register(`units.${index}.bedrooms`)}
                  label={t("properties.form.bedrooms")}
                  min={0}
                  type="number"
                  error={errors.units?.[index]?.bedrooms?.message}
                />
                <Input
                  {...register(`units.${index}.bathrooms`)}
                  label={t("properties.form.bathrooms")}
                  min={0}
                  type="number"
                  error={errors.units?.[index]?.bathrooms?.message}
                />
                <Input
                  {...register(`units.${index}.squareFeet`)}
                  label={t("properties.form.squareFeet")}
                  min={0}
                  type="number"
                  error={errors.units?.[index]?.squareFeet?.message}
                />
                <Button
                  disabled={fields.length === 1}
                  className="absolute right-0 top-[23px] max-w-"
                  size="lg"
                  variant="danger"
                  onClick={() => remove(index)}
                >
                  <FaTrash />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              className="mt-4"
              onClick={() =>
                append({
                  unitNumber: "",
                  bedrooms: "1",
                  bathrooms: "1",
                  squareFeet: "100",
                })
              }
            >
              {t("properties.form.addUnit")}
            </Button>
          </Fieldset>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.buttons.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("properties.form.saving")
                : propertyId
                ? t("properties.form.updateProperty")
                : t("properties.form.createProperty")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
