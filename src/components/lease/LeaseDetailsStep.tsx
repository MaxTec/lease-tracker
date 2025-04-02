"use client";

import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { addYears, format, getDate, parse } from "date-fns";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import DateInput from "@/components/ui/DateInput";
import Checkbox from "@/components/ui/Checkbox";
import { useProperties } from "@/hooks/useProperties";
import { useTenants } from "@/hooks/useTenants";
import toast from "react-hot-toast";

export default function LeaseDetailsStep() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { properties, units, handlePropertyChange } = useProperties();
  const { tenants } = useTenants();

  const startDate = watch("startDate");
  const customEndDate = watch("customEndDate");
  const propertyId = watch("propertyId");
  const existingUnitId = watch("unitId");
  const existingTenantId = watch("tenantId");
  const existingPaymentDay = watch("paymentDay");
  const paymentDay = watch("paymentDay");

  useEffect(() => {
    if (startDate && !customEndDate) {
      const start = new Date(startDate);
      const end = addYears(start, 1);
      setValue("endDate", format(end, "yyyy-MM-dd"), { shouldValidate: true });
    }
  }, [startDate, customEndDate, setValue]);

  useEffect(() => {
    console.log("populting:", propertyId, units, existingUnitId);
    if (properties.length > 0 && propertyId) {
      setValue("propertyId", propertyId);
      // handlePropertyChange(propertyId);
    }
    if (!units.length && propertyId) {
      handlePropertyChange(propertyId);
    }
    if (units.length > 0 && existingUnitId) {
      setValue("unitId", existingUnitId);
    }
    if (tenants.length > 0 && existingTenantId) {
      setValue("tenantId", existingTenantId);
    }
    if (existingPaymentDay) {
      setValue("paymentDay", existingPaymentDay);
    }
  }, [tenants, units, propertyId]);

  // New effect for validating start date against payment day
  useEffect(() => {
    if (startDate && paymentDay) {
      const start = parse(startDate, "yyyy-MM-dd", new Date());
      const currentDay = getDate(new Date(start));

      let isValid = false;
      let requiredDay = 1;

      if (paymentDay === "1") {
        isValid = currentDay === 1;
        requiredDay = 1;
      } else if (paymentDay === "15") {
        isValid = currentDay <= 15; // Changed logic to ensure startDate does not start after 15
        requiredDay = 15;
      } else if (paymentDay === "30") {
        isValid = currentDay <= 30;
        requiredDay = 30;
      }

      if (!isValid) {
        if (!errors.startDate) {
          toast.error(
            `Start date must be on or before the ${requiredDay}${
              requiredDay === 1 ? "st" : "th"
            } of the month for the selected payment day`,
            { id: "startDateError" }
          );
        }
        setValue("startDate", "");
      }
    }
  }, [startDate, paymentDay, setValue]);

  return (
    <div className="space-y-6">
      <Select
        {...register("propertyId")}
        onChange={(e) => {
          handlePropertyChange(e.target.value);
        }}
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
          {...register("rentAmount", { min: 0 })}
          label="Rent Amount"
          type="number"
          error={errors.rentAmount?.message as string}
          min="0"
        />

        <Input
          {...register("depositAmount", { min: 0 })}
          label="Deposit Amount"
          type="number"
          error={errors.depositAmount?.message as string}
          min="0"
        />

        <Select
          {...register("paymentDay")}
          label="Payment Day"
          error={errors.paymentDay?.message as string}
          options={[
            { value: "1", label: "1st of the month" },
            { value: "15", label: "15th of the month" },
            { value: "30", label: "last day of the month" },
          ]}
        />
      </div>
    </div>
  );
}
