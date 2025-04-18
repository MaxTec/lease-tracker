"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { addYears, format, getDate, parse, formatISO } from "date-fns";
import { useTranslations } from "next-intl";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import DateInput from "@/components/ui/DateInput";
import Checkbox from "@/components/ui/Checkbox";
import { useProperties } from "@/hooks/useProperties";
import { useTenants } from "@/hooks/useTenants";
import toast from "react-hot-toast";

export default function LeaseDetailsStep() {
  const t = useTranslations();
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

  const [unitsState, setUnitsState] = useState<{ value: string; label: string }[]>([]);
  const [tenantsState, setTenantsState] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Fetch units
        const unitsResponse = await fetch("/api/units");
        const unitsData = await unitsResponse.json();
        const formattedUnits = unitsData.map((unit: any) => ({
          value: unit.id.toString(),
          label: `${unit.property.name} - ${t("leases.form.unit")} ${unit.unitNumber}`,
        }));
        setUnitsState(formattedUnits);

        // Fetch tenants
        const tenantsResponse = await fetch("/api/tenants");
        const tenantsData = await tenantsResponse.json();
        const formattedTenants = tenantsData.map((tenant: any) => ({
          value: tenant.id.toString(),
          label: tenant.user.name,
        }));
        setTenantsState(formattedTenants);
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [t]);

  useEffect(() => {
    if (startDate && !customEndDate) {
      const start = new Date(startDate);
      const end = addYears(start, 1);
      setValue("endDate", formatISO(end, { representation: "date" }));
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

  if (loading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Checkbox
          id="hasExistingLease"
          {...register("hasExistingLease")}
          label={t("leases.form.hasExistingLease")}
        />
        <p className="ml-2 text-xs text-gray-500">
          {t("leases.form.hasExistingLeaseHint")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Select
          label={t("leases.form.property")}
          {...register("unitId")}
          options={unitsState}
          error={errors.unitId?.message as string}
          required
        />

        <Select
          label={t("leases.form.tenant")}
          {...register("tenantId")}
          options={tenantsState}
          error={errors.tenantId?.message as string}
          required
        />

        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DateInput
              label={t("leases.form.startDate")}
              onChange={field.onChange}
              value={field.value}
              error={errors.startDate?.message as string}
              required
            />
          )}
        />

        <div>
          <div className="flex items-center">
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  label={t("leases.form.endDate")}
                  onChange={field.onChange}
                  value={field.value}
                  disabled={!customEndDate && startDate}
                  error={errors.endDate?.message as string}
                  required
                />
              )}
            />
          </div>
          
          <div className="mt-2">
            <Checkbox
              id="customEndDate"
              {...register("customEndDate")}
              label={t("leases.form.customEndDate")}
              className="text-sm"
            />
          </div>
        </div>

        <Input
          label={t("leases.form.rentAmount")}
          type="number"
          {...register("rentAmount")}
          error={errors.rentAmount?.message as string}
          startAdornment="$"
          required
        />

        <Input
          label={t("leases.form.securityDeposit")}
          type="number"
          {...register("depositAmount")}
          error={errors.depositAmount?.message as string}
          startAdornment="$"
          required
        />

        <div>
          <Input
            label={t("leases.form.paymentDueDay")}
            type="number"
            min={1}
            max={31}
            {...register("paymentDay")}
            error={errors.paymentDay?.message as string}
            className="mb-1"
            required
          />
          <p className="text-xs text-gray-500">
            {t("leases.form.paymentDueDayHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
