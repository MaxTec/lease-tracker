"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DateInput from "@/components/ui/DateInput";

// Define the validation schema using zod
const leaseSchema = z.object({
  unitId: z.string().nonempty("Unit is required"),
  tenantId: z.string().nonempty("Tenant is required"),
  startDate: z.string().nonempty("Start date is required"),
  endDate: z.string().nonempty("End date is required"),
  rentAmount: z.string().nonempty("Rent amount is required").transform(Number),
  depositAmount: z
    .string()
    .nonempty("Deposit amount is required")
    .transform(Number),
  paymentDay: z.string().nonempty("Payment day is required").transform(Number),
});

interface Tenant {
  id: number;
  user: {
    name: string;
  };
}

interface Property {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  unitNumber: string;
}

interface Lease {
  id: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  paymentDay: number;
  status: string;
  tenant: {
    user: {
      name: string;
    };
  };
  unit: {
    unitNumber: string;
    property: {
      name: string;
    };
  };
}

interface NewLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  onLeaseCreated: (lease: Lease) => void;
}

export default function NewLeaseModal({
  isOpen,
  onClose,
  tenants,
  onLeaseCreated,
}: NewLeaseModalProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(leaseSchema),
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [, setSelectedPropertyId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchProperties = async () => {
        try {
          const response = await fetch("/api/properties");
          if (!response.ok) throw new Error("Failed to fetch properties");
          const data = await response.json();
          setProperties(data);
        } catch (error) {
          console.error("Error fetching properties:", error);
        }
      };

      fetchProperties();
    }
  }, [isOpen]);

  const onSubmit = async (data: z.infer<typeof leaseSchema>) => {
    try {
      const response = await fetch('/api/leases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create lease');
      }

      const newLease = await response.json();
      onLeaseCreated(newLease);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating lease:', error);
      // You might want to add error handling UI here
    }
  };

  const handlePropertyChange = async (propertyId: string) => {
    setSelectedPropertyId(parseInt(propertyId));
    setUnits([]); // Reset units when property changes

    if (propertyId) {
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        if (!response.ok) throw new Error("Failed to fetch units");
        const propertyData = await response.json();
        setUnits(propertyData.units); // Assuming the API returns units in the property data
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Lease">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Select
          onChange={(e) => handlePropertyChange(e.target.value)}
          label="Property"
          options={properties.map((property) => ({
            value: property.id.toString(),
            label: property.name,
          }))}
          error={errors.unitId?.message} // You can adjust this error handling as needed
        />
        <Select
          {...register("unitId")}
          label="Unit"
          options={units.map((unit) => ({
            value: unit.id.toString(),
            label: unit.unitNumber,
          }))}
          error={errors.unitId?.message}
        />
        <Select
          {...register("tenantId")}
          label="Tenant"
          options={tenants.map((tenant) => ({
            value: tenant.id.toString(),
            label: tenant.user.name,
          }))}
          error={errors.tenantId?.message}
        />
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Start Date"
                value={field.value}
                onChange={field.onChange}
                error={errors.startDate?.message}
              />
            )}
          />
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="End Date"
                value={field.value}
                onChange={field.onChange}
                error={errors.endDate?.message}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            {...register("rentAmount")}
            label="Rent Amount"
            type="number"
            error={errors.rentAmount?.message}
          />

          <Input
            {...register("depositAmount")}
            label="Deposit Amount"
            type="number"
            error={errors.depositAmount?.message}
          />

          <Input
            {...register("paymentDay")}
            label="Payment Day"
            type="number"
            error={errors.paymentDay?.message}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Lease</Button>
        </div>
      </form>
    </Modal>
  );
}
