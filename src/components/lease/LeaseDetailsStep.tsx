"use client";

import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { addYears, format } from "date-fns";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import DateInput from "@/components/ui/DateInput";
import Checkbox from "@/components/ui/Checkbox";
import { useProperties } from "@/hooks/useProperties";
import { useTenants } from "@/hooks/useTenants";

export default function LeaseDetailsStep() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext();

  const { properties, units, handlePropertyChange } = useProperties();
  const { tenants } = useTenants();

  const startDate = watch("startDate");
  const customEndDate = watch("customEndDate");

  useEffect(() => {
    if (startDate && !customEndDate) {
      const start = new Date(startDate);
      const end = addYears(start, 1);
      setValue("endDate", format(end, "yyyy-MM-dd"));
    }
  }, [startDate, customEndDate, setValue]);

  return (
    <div className="space-y-6">
      <Select
        onChange={(e) => handlePropertyChange(e.target.value)}
        label="Property"
        options={properties.map((property) => ({
          value: property.id.toString(),
          label: property.name,
        }))}
        error={errors.unitId?.message as string}
      />

      <Select
        {...register("unitId")}
        label="Unit"
        options={units.map((unit) => ({
          value: unit.id.toString(),
          label: unit.unitNumber,
        }))}
        error={errors.unitId?.message as string}
      />

      <Select
        {...register("tenantId")}
        label="Tenant"
        options={tenants.map((tenant) => ({
          value: tenant.id.toString(),
          label: tenant.user.name,
        }))}
        error={errors.tenantId?.message as string}
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
              error={errors.startDate?.message as string}
            />
          )}
        />
        <div className="space-y-2">
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="End Date"
                value={field.value}
                onChange={field.onChange}
                error={errors.endDate?.message as string}
                disabled={!customEndDate}
              />
            )}
          />
          <Checkbox
            {...register("customEndDate")}
            label="Set custom end date"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          {...register("rentAmount")}
          label="Rent Amount"
          type="number"
          error={errors.rentAmount?.message as string}
        />

        <Input
          {...register("depositAmount")}
          label="Deposit Amount"
          type="number"
          error={errors.depositAmount?.message as string}
        />

        <Input
          {...register("paymentDay")}
          label="Payment Day"
          type="number"
          error={errors.paymentDay?.message as string}
        />
      </div>
    </div>
  );
} 