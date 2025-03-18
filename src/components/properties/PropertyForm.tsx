import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaTrash } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Fieldset from '@/components/ui/Fieldset';
import Modal from '@/components/ui/Modal';

// Define the Zod schema for Property
const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  type: z.string().min(1, "Property type is required"),
  landlordId: z.string().min(1, "Landlord is required"),
  units: z.array(z.object({
    unitNumber: z.string().min(1, "required"),
    bedrooms: z.string().min(0, "Bedrooms cannot be negative"),
    bathrooms: z.string().min(0, "Bathrooms cannot be negative"),
    squareFeet: z.string().min(0, "Square feet cannot be negative"),
  })).min(1, "At least one unit is required"),
});

interface Property {
  id?: number;
  name: string;
  address: string;
  type: string;
  landlordId: string;
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
}

export default function PropertyForm({ propertyId, isOpen, onClose }: PropertyFormProps) {
  const router = useRouter();
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<Property>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      address: '',
      type: '',
      landlordId: '',
      units: [{ unitNumber: '', bedrooms: 0, bathrooms: 0, squareFeet: 0 }],
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
        const landlordsRes = await fetch('/api/landlords');
        if (!landlordsRes.ok) throw new Error('Failed to fetch landlords');
        const landlordsData = await landlordsRes.json();
        setLandlords(landlordsData);

        // If editing, fetch property data
        if (propertyId) {
          const propertyRes = await fetch(`/api/properties/${propertyId}`);
          if (!propertyRes.ok) throw new Error('Failed to fetch property');
          const propertyData = await propertyRes.json();
          // setValue('name', propertyData.name);
          // setValue('address', propertyData.address);
          // setValue('type', propertyData.type);
          // setValue('landlordId', propertyData.landlordId);
          // Set units if editing
          // remove all units before
          console.log(propertyData.units);
          remove();
          propertyData.units.forEach(unit => append(unit));
        }
      } catch (err) {
        setError('Failed to load form data');
        console.error(err);
      }
    };

    fetchData();
  }, [propertyId, setValue, append]);

  const onSubmit = async (data: Property) => {
    setLoading(true);
    setError(null);

    try {
      const url = propertyId ? `/api/properties/${propertyId}` : '/api/properties';
      const method = propertyId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      router.push('/properties');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={propertyId ? "Edit Property" : "Add New Property"}>
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
              { value: 'APARTMENT', label: 'Apartment' },
              { value: 'HOUSE', label: 'House' },
              { value: 'COMMERCIAL', label: 'Commercial' },
              { value: 'OTHER', label: 'Other' },
            ]}
            error={errors.type?.message}
          />

          <Select
            {...register("landlordId")}
            label="Landlord"
            options={landlords.map((landlord) => ({
              value: landlord.id,
              label: landlord.user.name
            }))}
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
              <Button disabled={fields.length === 1} className="absolute right-0 top-[23px]" size="lg" variant="danger" onClick={() => remove(index)}>
                <FaTrash />
              </Button>
            </div>
          ))}
        </Fieldset>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : propertyId ? 'Update Property' : 'Create Property'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 