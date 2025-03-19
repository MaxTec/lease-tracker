import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaTrash } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Fieldset from "@/components/ui/Fieldset";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "../ui/LoadingSpinner";

// Define the Zod schema for Property
const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  type: z.string().min(1, "Property type is required"),
  landlordId: z.string().optional(),
  units: z
    .array(
      z.object({
        unitNumber: z.string().min(1, "required"),
        bedrooms: z.number(),
        bathrooms: z.number(),
        squareFeet: z.number(),
      })
    )
    .min(1, "At least one unit is required"),
});

interface Property {
  id?: number;
  name: string;
  address: string;
  type: string;
  landlordId: number;
  units: {
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
  }[];
}

interface Landlord {
  id: number;
  user: {
    name: string;
  };
}

interface PropertyFormProps {
  propertyId?: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Property[]) => void;
}

export default function PropertyForm({
  propertyId,
  isOpen,
  onClose,
  onUpdate,
}: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<Property>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      address: "",
      type: "",
      landlordId: undefined,
      units: [{ unitNumber: "", bedrooms: 1, bathrooms: 2, squareFeet: 100 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "units", // Name of the field array
  });

  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch landlords
        setLoading(true);
        const landlordsRes = await fetch("/api/landlords");
        if (!landlordsRes.ok) throw new Error("Failed to fetch landlords");
        const landlordsData = await landlordsRes.json();
        setLandlords(landlordsData);

        // If editing, fetch property data
        if (propertyId) {
          const propertyRes = await fetch(`/api/properties/${propertyId}`);
          if (!propertyRes.ok) throw new Error("Failed to fetch property");
          const propertyData = await propertyRes.json();
          // Convert landlordId to string
          propertyData.landlordId = String(propertyData.landlordId);
          reset(propertyData);
          setLoading(false);
        } else {
          reset({
            name: "",
            address: "",
            type: "",
            landlordId: undefined,
            units: [
              { unitNumber: "", bedrooms: 1, bathrooms: 2, squareFeet: 100 },
            ],
          });
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to load form data");
        console.error(err);
      }
    };

    fetchData();
  }, [propertyId, setValue, append]);

  const onSubmit = async (data: Property) => {
    setLoading(true);
    setError(null);

    try {
      const url = propertyId
        ? `/api/properties/${propertyId}`
        : "/api/properties";
      const method = propertyId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save property");
      }
      const responseData = await response.json();
      onClose();
      console.log("response", responseData);
      onUpdate(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  console.log("values", getValues());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={propertyId ? "Edit Property" : "Add New Property"}
    >
      {loading ? (
        <div className="flex justify-center items-center min-h-[250px]">
          <LoadingSpinner />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <Input
            {...register("name")}
            label="Property Name"
            error={errors.name?.message}
          />

          <Input
            {...register("address")}
            label="Address"
            error={errors.address?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              {...register("type")}
              label="Property Type"
              options={[
                { value: "APARTMENT", label: "Apartment" },
                { value: "HOUSE", label: "House" },
                { value: "COMMERCIAL", label: "Commercial" },
                { value: "OTHER", label: "Other" },
              ]}
              error={errors.type?.message}
            />

            <Select
              {...register("landlordId")}
              label="Landlord"
              options={landlords.map((landlord) => {
                console.log("landlord", landlord);
                return {
                  value: landlord.id,
                  label: landlord.user.name,
                };
              })}
              error={errors.landlordId?.message}
            />
          </div>

          <Fieldset legend="Units">
            {fields.map((unit, index) => (
              <div key={unit.id} className="flex space-x-4 mb-4 relative pr-20">
                <Input
                  {...register(`units.${index}.unitNumber`)}
                  label="Number"
                  error={errors.units?.[index]?.unitNumber?.message}
                />
                <Input
                  {...register(`units.${index}.bedrooms`)}
                  label="Bedrooms"
                  min={0}
                  type="number"
                  error={errors.units?.[index]?.bedrooms?.message}
                />
                <Input
                  {...register(`units.${index}.bathrooms`)}
                  label="Bathrooms"
                  min={0}
                  type="number"
                  error={errors.units?.[index]?.bathrooms?.message}
                />
                <Input
                  {...register(`units.${index}.squareFeet`)}
                  label="m2"
                  min={0}
                  type="number"
                  error={errors.units?.[index]?.squareFeet?.message}
                />
                <Button
                  disabled={fields.length === 1}
                  className="absolute right-0 top-[23px]"
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
                  bedrooms: 1,
                  bathrooms: 2,
                  squareFeet: 100,
                })
              }
            >
              Add Unit
            </Button>
          </Fieldset>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : propertyId
                ? "Update Property"
                : "Create Property"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
