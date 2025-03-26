"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import StepIndicator from "@/components/ui/StepIndicator";
import LeaseDetailsStep from "@/components/lease/LeaseDetailsStep";
import LeaseRulesStep from "@/components/lease/LeaseRulesStep";
import LeasePreviewStep from "@/components/lease/LeasePreviewStep";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";

// Separate validation schemas for each step
const leaseDetailsSchema = z.object({
  unitId: z.string().nonempty("Unit is required"),
  tenantId: z.string().nonempty("Tenant is required"),
  startDate: z.string().nonempty("Start date is required"),
  endDate: z.string().nonempty("End date is required"),
  rentAmount: z.string().nonempty("Rent amount is required").transform(Number),
  depositAmount: z
    .string()
    .nonempty("Deposit amount is required")
    .transform(Number),
  paymentDay: z
    .string()
    .nonempty("Payment day is required")
    .transform(Number)
    .refine(
      (val) => val >= 1 && val <= 31,
      "Payment day must be between 1 and 31"
    ),
  customEndDate: z.boolean().default(false),
});

const leaseRulesSchema = z.object({
  selectedRules: z
    .array(z.number())
    .min(1, "At least one rule must be selected"),
  selectedClauses: z
    .array(z.number())
    .min(1, "At least one clause must be selected"),
  customClauses: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .default([]),
});

// Combined schema for the entire form
const leaseSchema = leaseDetailsSchema.merge(leaseRulesSchema);

type LeaseFormData = z.infer<typeof leaseSchema>;

const steps = [
  { title: "Lease Details", description: "Enter basic lease information" },
  {
    title: "Rules & Clauses",
    description: "Select applicable rules and clauses",
  },
  {
    title: "Preview & Submit",
    description: "Review and generate lease agreement",
  },
];

// Add after LeaseFormData type definition
const defaultFormValues: LeaseFormData = {
  unitId: "",
  tenantId: "",
  startDate: "",
  endDate: "",
  rentAmount: "",
  depositAmount: "",
  paymentDay: "",
  customEndDate: false,
  selectedRules: [],
  selectedClauses: [],
  customClauses: [],
};

export default function NewLeasePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<LeaseFormData>(defaultFormValues);

  const methods = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: formData, // Use the formData as defaultValues
    mode: "onChange", // Enable real-time validation
  });

  const {
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;

  const validateCurrentStep = async () => {
    let fieldsToValidate: Array<keyof LeaseFormData> = []; // Properly type the fields array

    switch (currentStep) {
      case 0:
        fieldsToValidate = [
          "unitId",
          "tenantId",
          "startDate",
          "endDate",
          "rentAmount",
          "depositAmount",
          "paymentDay",
        ];
        break;
      case 1:
        fieldsToValidate = ["selectedRules", "selectedClauses"];
        break;
      default:
        return true;
    }

    const isStepValid = await trigger(fieldsToValidate);
    console.log("isStepValid", isStepValid);
    if (!isStepValid) {
      const firstError = Object.values(errors)[0]?.message;
      console.log("firstError", firstError);
      if (firstError) {
        toast.error(firstError as string);
      }
    }

    // Save form data when step is valid
    if (isStepValid) {
      const currentFormData = methods.getValues();
      setFormData(currentFormData);
    }

    return isStepValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      // Save current form data before moving to next step
      const currentFormData = methods.getValues();
      setFormData(currentFormData);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const previousStep = () => {
    // Save current form data before moving to previous step
    const currentFormData = methods.getValues();
    setFormData(currentFormData);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: LeaseFormData) => {
    try {
      setFormData(data); // Save final form data
      const response = await fetch("/api/leases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create lease");
      }

      const newLease = await response.json();
      toast.success("Lease created successfully");
      router.push(`/leases/${newLease.id}`);
    } catch (error) {
      console.error("Error creating lease:", error);
      toast.error("Failed to create lease");
    }
  };
  console.log("formData", formData);
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <LeaseDetailsStep />;
      case 1:
        return <LeaseRulesStep />;
      case 2:
        return <LeasePreviewStep />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
              Create New Lease
            </h1>

            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              className="mb-8"
            />

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {renderStep()}

                <div className="flex justify-between mt-8">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={previousStep}
                    >
                      Previous
                    </Button>
                  )}

                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="ml-auto"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" className="ml-auto">
                      Create Lease
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </Layout>
  );
}
