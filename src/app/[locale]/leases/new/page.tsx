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
import LeaseUploadStep from "@/components/lease/LeaseUploadStep";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";

const leaseSchema = z
  .object({
    propertyId: z.string().nonempty("Property is required"),
    unitId: z.string().nonempty("Unit is required"),
    tenantId: z.string().nonempty("Tenant is required"),
    startDate: z.string().nonempty("Start date is required"),
    endDate: z.string().nonempty("End date is required"),
    rentAmount: z.string().nonempty("Rent amount is required"),
    depositAmount: z.string().nonempty("Deposit amount is required"),
    paymentDay: z.string().nonempty("Payment day is required"),
    customEndDate: z.boolean().default(false),
    hasExistingLease: z.boolean().default(false),
    selectedRules: z.array(z.string()).default([]),
    selectedClauses: z.array(z.string()).default([]),
    agreementVerified: z.boolean().default(false),
    signedLeaseFile: z.instanceof(File).optional(),
  })
  .refine(
    (data) => {
      if (data.hasExistingLease) {
        return !!data.signedLeaseFile;
      }
      return true;
    },
    {
      message: "You must upload a signed lease file",
      path: ["signedLeaseFile"],
    }
  )
  .refine(
    (data) => {
      if (!data.hasExistingLease) {
        return data.selectedRules.length > 0;
      }
      return true;
    },
    {
      message: "At least one rule must be selected",
      path: ["selectedRules"],
    }
  )
  .refine(
    (data) => {
      if (!data.hasExistingLease) {
        return data.selectedClauses.length > 0;
      }
      return true;
    },
    {
      message: "At least one clause must be selected",
      path: ["selectedClauses"],
    }
  )
  .refine(
    (data) => {
      if (!data.hasExistingLease) {
        return data.agreementVerified === true;
      }
      return true;
    },
    {
      message: "You must verify that you have reviewed the lease agreement",
      path: ["agreementVerified"],
    }
  );

type LeaseFormData = z.infer<typeof leaseSchema>;

const defaultFormValues = {
  unitId: "",
  tenantId: "",
  startDate: "",
  endDate: "",
  rentAmount: "",
  depositAmount: "",
  paymentDay: "",
  customEndDate: false,
  hasExistingLease: false,
  signedLeaseFile: undefined,
  selectedRules: [],
  selectedClauses: [],
  agreementVerified: false,
};

export default function NewLeasePage() {
  const t = useTranslations();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define steps with translations
  const steps = [
    { 
      title: t("leases.new.steps.details.title"), 
      description: t("leases.new.steps.details.description") 
    },
    {
      title: t("leases.new.steps.rules.title"),
      description: t("leases.new.steps.rules.description")
    },
    {
      title: t("leases.new.steps.preview.title"),
      description: t("leases.new.steps.preview.description")
    },
  ];

  const methods = useForm<LeaseFormData>({
    resolver: zodResolver(leaseSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    formState: { errors },
    watch,
  } = methods;

  const validateCurrentStep = async () => {
    let fieldsToValidate: Array<keyof LeaseFormData> = [];
    const formValues = methods.getValues();

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
        if (formValues.hasExistingLease) {
          return true; // Skip validation for rules if using existing lease
        }
        fieldsToValidate = ["selectedRules", "selectedClauses"];
        break;
      case 2:
        fieldsToValidate = [];
        if (formValues.hasExistingLease) {
          fieldsToValidate.push("signedLeaseFile" as keyof LeaseFormData);
        } else {
          fieldsToValidate.push("agreementVerified");
        }
        break;
      default:
        return true;
    }
    console.log("fieldsToValidate", fieldsToValidate);
    const isStepValid = await trigger(fieldsToValidate);
    console.log("isStepValid", isStepValid);
    if (!isStepValid && currentStep > 0) {
      Object.values(errors).forEach((error) => {
        if (error) {
          toast.error(error.message as string);
        }
      });
    }

    return isStepValid;
  };

  const nextStep = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    const isValid = await validateCurrentStep();
    console.log("isValid", isValid);
    console.log("errors", errors);
    if (isValid) {
      const formValues = methods.getValues();
      console.log(formValues);
      //console
      if (currentStep === 0 && formValues.hasExistingLease) {
        // Skip step 1 (rules) and go directly to step 2 if has existing lease
        setCurrentStep(2);
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    }
  };

  const previousStep = () => {
    console.log(errors);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: LeaseFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      console.log("data", data);
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          ...data,
          signedLeaseFile: undefined, // Remove the file from JSON data
        })
      );

      // Append the signed lease file if it exists
      if (data.signedLeaseFile) {
        formData.append("signedLeaseFile", data.signedLeaseFile);
      }

      const response = await fetch("/api/leases", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("leases.errors.createFailed"));
      }

      toast.success(t("leases.notifications.createSuccess"));
      router.push(`/leases/${result.id}`);
    } catch (error) {
      console.error("Error creating lease:", error);
      const errorMessage = error instanceof Error ? error.message : t("leases.errors.createFailed");
      setError(errorMessage);
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
        return watch('hasExistingLease') ? 
          <LeaseUploadStep /> : 
          <LeasePreviewStep />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {t("leases.new.title")}
            </h2>

            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              className="mb-8"
            />

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
                {renderStep()}

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-4 mt-8 border-t border-gray-200">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={previousStep}
                    disabled={currentStep === 0}
                  >
                    {t("common.buttons.back")}
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep}>
                      {/* {t("common.buttons.next")} */}
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                    >
                      {/* {t("leases.new.submit")} */}
                      Submit
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
