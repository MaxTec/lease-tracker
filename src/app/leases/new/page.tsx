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

// Fix the schema definitions
const leaseDetailsSchema = z.object({
  unitId: z.string().nonempty("Unit is required"),
  tenantId: z.string().nonempty("Tenant is required"),
  startDate: z.string().nonempty("Start date is required"),
  endDate: z.string().nonempty("End date is required"),
  rentAmount: z.string().nonempty("Rent amount is required"),  // Keep as string for form handling
  depositAmount: z.string().nonempty("Deposit amount is required"), // Keep as string for form handling
  paymentDay: z.string().nonempty("Payment day is required"), // Keep as string for form handling
  customEndDate: z.boolean().default(false),
});

const leaseRulesSchema = z.object({
  selectedRules: z.array(z.string()).min(1, "At least one rule must be selected").default([]),
  selectedClauses: z.array(z.string()).min(1, "At least one clause must be selected").default([]),
  customClauses: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    })
  ).default([]),
});

// Combined schema for the entire form
const leaseSchema = leaseDetailsSchema.merge(leaseRulesSchema).extend({
  agreementVerified: z.boolean().refine((val) => val === true, {
    message: "You must verify that you have reviewed the lease agreement"
  })
});

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

// Fix the defaultFormValues to match the schema types
const defaultFormValues = {
  unitId: "",
  tenantId: "",
  startDate: "",
  endDate: "",
  rentAmount: "",
  depositAmount: "",
  paymentDay: "",
  customEndDate: false,
  selectedRules: [] as string[],
  selectedClauses: [] as string[],
  customClauses: [] as { title: string; content: string }[],
  agreementVerified: false,
};

export default function NewLeasePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(defaultFormValues);

  const methods = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    formState: { errors },
  } = methods;

  const validateCurrentStep = async () => {
    let fieldsToValidate: Array<keyof LeaseFormData> = [];

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
      case 2:
        fieldsToValidate = ["agreementVerified"];
        break;
      default:
        return true;
    }

    const isStepValid = await trigger(fieldsToValidate);
    console.log("Step validation result:", isStepValid);
    console.log("Current form values:", methods.getValues());
    console.log("Form errors:", methods.formState.errors);

    if (!isStepValid) {
      const firstError = Object.values(errors)[0]?.message;
      if (firstError) {
        toast.error(firstError as string);
      }
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
