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

const leaseDetailsSchema = z.object({
  unitId: z.string().nonempty("Unit is required"),
  tenantId: z.string().nonempty("Tenant is required"),
  startDate: z.string().nonempty("Start date is required"),
  endDate: z.string().nonempty("End date is required"),
  rentAmount: z.string().nonempty("Rent amount is required"), // Keep as string for form handling
  depositAmount: z.string().nonempty("Deposit amount is required"), // Keep as string for form handling
  paymentDay: z.string().nonempty("Payment day is required"), // Keep as string for form handling
  customEndDate: z.boolean().default(false),
});

const leaseRulesSchema = z.object({
  selectedRules: z
    .array(z.string())
    .min(1, "At least one rule must be selected")
    .default([]),
  selectedClauses: z
    .array(z.string())
    .min(1, "At least one clause must be selected")
    .default([]),
});

// Combined schema for the entire form
const leaseSchema = leaseDetailsSchema.merge(leaseRulesSchema).extend({
  agreementVerified: z.boolean().refine((val) => val === true, {
    message: "You must verify that you have reviewed the lease agreement",
  }),
  signedLeaseFile: z.instanceof(File).optional(),
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
  agreementVerified: false,
};

export default function NewLeasePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // toast.error(firstError as string);
        Object.values(errors).forEach((error) => {
          if (error) {
            toast.error(error.message as string);
          }
        });
      }
    }

    return isStepValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: LeaseFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append('data', JSON.stringify({
        ...data,
        signedLeaseFile: undefined // Remove the file from JSON data
      }));
      
      // Append the signed lease file if it exists
      if (data.signedLeaseFile) {
        formData.append('signedLeaseFile', data.signedLeaseFile);
      }

      const response = await fetch('/api/leases', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create lease');
      }

      const lease = await response.json();
      router.push(`/leases/${lease.id}`);
    } catch (error) {
      console.error('Error creating lease:', error);
      setError('Failed to create lease. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                
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
                    <Button
                      disabled={!methods.formState.isValid}
                      type="submit"
                      className="ml-auto"
                    >
                      {isSubmitting ? 'Creating Lease...' : 'Create Lease'}
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
