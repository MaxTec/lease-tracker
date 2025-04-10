"use client";

import { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { addYears, format, getDate, parse } from "date-fns";
import { useRouter } from "next/navigation";
import { FiHome, FiUsers } from "react-icons/fi";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import DateInput from "@/components/ui/DateInput";
import Checkbox from "@/components/ui/Checkbox";
import Empty from "@/components/ui/Empty";
import { useProperties } from "@/hooks/useProperties";
import { useTenants } from "@/hooks/useTenants";
import toast from "react-hot-toast";
import TenantForm from "@/components/tenants/TenantForm";
import PropertyForm from "@/components/properties/PropertyForm";
import Modal from "@/components/ui/Modal";
import { Tenant } from "@/types/tenant";
import { Property } from "@/types/property";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LeaseDetailsStep() {
  const router = useRouter();
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const {
    properties,
    setProperties,
    units,
    handlePropertyChange,
    isLoadingUnits,
    isLoadingProperties,
  } = useProperties();
  const { tenants, setTenants, isLoadingTenants } = useTenants();

  const startDate = watch("startDate");
  const customEndDate = watch("customEndDate");
  const existingPropertyId = watch("propertyId");
  const existingUnitId = watch("unitId");
  const existingTenantId = watch("tenantId");
  // const existingPaymentDay = watch("paymentDay");
  const paymentDay = watch("paymentDay");

  const [isTenantModalOpen, setTenantModalOpen] = useState(false);
  const [isPropertyModalOpen, setPropertyModalOpen] = useState(false);

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

  // useEffect(() => {
  //   if (!isMounted) return;
  //   if (properties.length > 0 && existingPropertyId ) {
  //     setValue("propertyId", existingPropertyId);
  //     // handlePropertyChange(existingPropertyId);
  //   }
  //   if (!units.length && existingPropertyId) {
  //     console.log("populating units");
  //     handlePropertyChange(existingPropertyId);
  //   }

  //   console.log("populating:", existingPropertyId, units, existingUnitId);
  //   if (units.length > 0 && existingUnitId) {
  //     setValue("unitId", existingUnitId);
  //   }
  //   if (tenants.length > 0 && existingTenantId) {
  //     setValue("tenantId", existingTenantId);
  //   }
  // }, [tenants, units, existingPropertyId, isMounted]);

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

  const handleTenantSuccess = (tenant: Tenant) => {
    setTenantModalOpen(false);
    setTenants((prevTenants) => [...prevTenants, tenant]);
    setValue("tenantId", tenant.id.toString(), { shouldValidate: true });
  };

  const handlePropertySuccess = (property: Property) => {
    console.log("property: executed", property);
    setPropertyModalOpen(false);
    setProperties((prevProperties) => [...prevProperties, property]);
    setValue("propertyId", property.id.toString(), { shouldValidate: true });
    handlePropertyChange(property.id.toString());
  };
  console.log("propertyId", existingPropertyId);
  if (isLoadingTenants || isLoadingProperties)
    return <LoadingSpinner />;
  return (
    <div className="space-y-6">
      {!existingPropertyId && properties.length === 0 ? (
        <Empty
          icon={<FiHome className="w-8 h-8 text-yellow-500" />}
          title="No Properties Available"
          description="Please add a property before creating a lease."
          action={{
            label: "Add Property",
            onClick: () => setPropertyModalOpen(true),
          }}
        />
      ) : (
        <Select
          {...register("propertyId")}
          onChange={(e) => {
            const selectedPropertyId = e.target.value;
            setValue("propertyId", selectedPropertyId, {
              shouldValidate: true,
            });
            // console.log("Selected propertyId:", selectedPropertyId);
            handlePropertyChange(selectedPropertyId);
          }}
          label="Property"
          options={properties.map((property) => ({
            value: property.id.toString(),
            label: property.name,
          }))}
          error={errors.propertyId?.message as string}
        />
      )}

      {existingPropertyId && units.length === 0 ? (
        <Empty
          icon={<FiHome className="w-8 h-8 text-yellow-500" />}
          title="No Units Available"
          description="Please add a unit to this property before creating a lease."
          action={{
            label: "Add Unit",
            onClick: () =>
              router.push(`/properties/${existingPropertyId}/units/new`),
          }}
        />
      ) : (
        <Select
          {...register("unitId")}
          label="Unit"
          options={units.map((unit) => ({
            value: unit.id.toString(),
            label: unit.unitNumber,
          }))}
          error={errors.unitId?.message as string}
          disabled={!existingPropertyId || isLoadingUnits}
        />
      )}

      {tenants.length === 0 ? (
        <Empty
          icon={<FiUsers className="w-8 h-8 text-yellow-500" />}
          title="No Tenants Available"
          description="Please add a tenant before creating a lease."
          action={{
            label: "Add Tenant",
            onClick: () => setTenantModalOpen(true),
          }}
        />
      ) : (
        <Select
          {...register("tenantId")}
          label="Tenant"
          options={tenants.map((tenant) => ({
            value: tenant.id.toString(),
            label: tenant.user.name,
          }))}
          error={errors.tenantId?.message as string}
        />
      )}

      <Modal
        isOpen={isTenantModalOpen}
        onClose={() => setTenantModalOpen(false)}
        title="Add Tenant"
      >
        <TenantForm
          onClose={() => setTenantModalOpen(false)}
          onSuccess={handleTenantSuccess}
        />
      </Modal>

      <Modal
        isOpen={isPropertyModalOpen}
        onClose={() => setPropertyModalOpen(false)}
        title="Add Property CUACK"
      >
        <PropertyForm
          isOpen={isPropertyModalOpen}
          onClose={() => setPropertyModalOpen(false)}
          onUpdate={(properties) => handlePropertySuccess(properties[0])}
        />
      </Modal>

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
