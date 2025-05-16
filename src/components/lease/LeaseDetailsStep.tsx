"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { addYears, format, getDate, parse } from "date-fns";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import DateInput from "@/components/ui/DateInput";
import Checkbox from "@/components/ui/Checkbox";
import { useProperties } from "@/hooks/useProperties";
import { useTenants } from "@/hooks/useTenants";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface LeaseDetailsStepProps {
  userId?: string;
  userRole?: string;
}

export default function LeaseDetailsStep({
  userId,
  userRole,
}: LeaseDetailsStepProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const {
    properties,
    units,
    handlePropertyChange,
    isLoadingUnits,
    isLoadingProperties,
  } = useProperties({ userId, userRole });
  const { tenants, isLoadingTenants } = useTenants({
    excludeActiveLease: true,
  });
  console.log("Tenants:", tenants);

  const startDate = watch("startDate");
  const customEndDate = watch("customEndDate");
  const existingPropertyId = watch("propertyId");

  const paymentDay = watch("paymentDay");

  const t = useTranslations("LeaseDetailsStep");

  // Use react-hook-form for tenantMode
  const tenantMode = watch("tenantMode") || "new";

  useEffect(() => {
    if (startDate && !customEndDate) {
      const start = new Date(startDate);
      const end = addYears(start, 1);
      setValue("endDate", format(end, "yyyy-MM-dd"), { shouldValidate: true });
    }
  }, [startDate, customEndDate, setValue]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-select first unit if more than one unit exists after property selection
  useEffect(() => {
    console.log("Units:", units);
    if (!existingPropertyId) return;
    if (units.length > 0) {
      console.log("Setting unitId:", units[0].id);
      setValue("unitId", units[0].id.toString(), { shouldValidate: true });
    }
  }, [units, existingPropertyId, setValue]);

  // New effect for validating start date against payment day
  useEffect(() => {
    if (!isMounted) return;
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
  }, [startDate, paymentDay]);

  if (isLoadingTenants || isLoadingProperties) return <LoadingSpinner />;

  const shouldShowPropertyFields = properties.length > 0;
  return (
    <div className="space-y-6">
      {!shouldShowPropertyFields && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md"
          role="alert"
          aria-live="assertive"
          tabIndex={0}
        >
          <div>
            {t("propertyDisclaimer")}{" "}
            <Link
              href="/properties"
              aria-label={t("addProperty")}
              className="inline-block mt-2 text-blue-700 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              {t("addProperty")}
            </Link>
          </div>
        </div>
      )}

      {shouldShowPropertyFields && (
        <>
          <Select
            {...register("propertyId")}
            onChange={(e) => {
              const selectedPropertyId = e.target.value;
              setValue("propertyId", selectedPropertyId, {
                shouldValidate: true,
              });
              handlePropertyChange(selectedPropertyId);
            }}
            label="Property"
            options={properties.map((property) => ({
              value: property.id.toString(),
              label: property.name,
            }))}
            error={errors.propertyId?.message as string}
            required
          />

          <Select
            required
            {...register("unitId")}
            label="Unit"
            options={units.map((unit) => ({
              value: unit.id.toString(),
              label: unit.unitNumber,
            }))}
            error={errors.unitId?.message as string}
            disabled={!existingPropertyId || isLoadingUnits}
          />
        </>
      )}

      {/* Tenant mode selector */}
      {tenants.length > 0 && (
        <Controller
          name="tenantMode"
          control={control}
          defaultValue="new"
          rules={{ required: "Please select tenant mode" }}
          render={({ field }) => (
            <div className="flex flex-col justify-start md:flex-row md:items-center md:space-x-6 space-y-3 md:space-y-0">
              <label className="flex md:items-center">
                <Input
                  type="radio"
                  name="tenantMode"
                  value="existing"
                  checked={field.value === "existing"}
                  onChange={() => field.onChange("existing")}
                  disabled={tenants.length === 0}
                  label="Select Existing Tenant"
                  className="mr-2 w-4 h-4"
                  style={{ width: 16, height: 16 }}
                />
              </label>
              <label className="flex md:items-center">
                <Input
                  type="radio"
                  name="tenantMode"
                  value="new"
                  checked={field.value === "new"}
                  onChange={() => field.onChange("new")}
                  disabled={tenants.length === 0}
                  label="Create New Tenant"
                  className="mr-2 w-4 h-4"
                  style={{ width: 16, height: 16 }}
                />
              </label>
              {errors.tenantMode && (
                <span className="text-red-500 text-sm ml-4">
                  {errors.tenantMode.message as string}
                </span>
              )}
            </div>
          )}
        />
      )}

      {tenantMode === "existing" ? (
        <Select
          {...register("tenantId", {
            required: tenantMode === "existing" ? "Tenant is required" : false,
          })}
          label="Select Tenant"
          options={tenants.map((tenant) => ({
            value: tenant.id.toString(),
            label: tenant.user.name,
          }))}
          error={errors.tenantId?.message as string}
        />
      ) : (
        <>
          <Input
            {...register("tenantName", {
              validate: (value) =>
                tenantMode === "new" && !value
                  ? "Tenant name is required"
                  : true,
            })}
            label="Tenant Name"
            error={errors.tenantName?.message as string}
            required
          />
          <Input
            {...register("tenantEmail", {
              validate: (value) =>
                tenantMode === "new" && !value
                  ? "Tenant email is required"
                  : true,
            })}
            label="Tenant Email"
            type="email"
            error={errors.tenantEmail?.message as string}
            required
          />
          <Input
            {...register("tenantPhone", {
              validate: (value) =>
                tenantMode === "new" && !value
                  ? "Tenant phone is required"
                  : true,
            })}
            label="Tenant Phone"
            error={errors.tenantPhone?.message as string}
            required
          />
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DateInput
              label="Start Date"
              required
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
                required
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

      <div className="grid grid-cols- md:grid-cols-3 gap-4">
        <Input
          {...register("rentAmount", { min: 0 })}
          label="Rent Amount"
          type="number"
          required
          error={errors.rentAmount?.message as string}
          min="0"
        />

        <Input
          {...register("depositAmount", { min: 0 })}
          label="Deposit Amount"
          type="number"
          required
          error={errors.depositAmount?.message as string}
          min="0"
        />

        <Select
          {...register("paymentDay")}
          label="Payment Day"
          required
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
