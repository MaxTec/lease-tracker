"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import StepIndicator from "@/components/ui/StepIndicator";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { FaInfoCircle, FaListUl, FaFileSignature } from "react-icons/fa";

const LeaseDetailsStep = dynamic(
  () => import("@/components/lease/LeaseDetailsStep"),
  { ssr: false }
);
const LeaseRulesStep = dynamic(
  () => import("@/components/lease/LeaseRulesStep"),
  { ssr: false }
);
const LeasePreviewStep = dynamic(
  () => import("@/components/lease/LeasePreviewStep"),
  { ssr: false }
);
const LeaseUploadStep = dynamic(
  () => import("@/components/lease/LeaseUploadStep"),
  { ssr: false }
);

const leaseSchema = z
  .object({
    propertyId: z.string().nonempty("Property is required"),
    unitId: z.string().nonempty("Unit is required"),
    tenantMode: z.enum(["existing", "new"]),
    tenantId: z.string().optional(),
    tenantName: z.string().optional(),
    tenantEmail: z.string().optional(),
    tenantPhone: z.string().optional(),
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
  .superRefine((data, ctx) => {
    if (data.tenantMode === "new") {
      if (!data.tenantName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tenantName"],
          message: "Tenant name is required",
        });
      }
      if (!data.tenantEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tenantEmail"],
          message: "Tenant email is required",
        });
      }
      if (!data.tenantPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tenantPhone"],
          message: "Tenant phone is required",
        });
      }
    }
    if (data.tenantMode === "existing") {
      if (!data.tenantId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tenantId"],
          message: "Tenant is required",
        });
      }
    }
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
  tenantName: "",
  tenantEmail: "",
  tenantPhone: "",
  tenantMode: "new" as const,
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

interface NewLeaseClientProps {
  userId?: string;
  userRole?: string;
}

const NewLeaseClient = ({
  userId: _userId,
  userRole: _userRole,
}: NewLeaseClientProps) => {
  const t = useTranslations();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define steps with translations
  const steps = [
    {
      title: t("leases.new.steps.details.title"),
      description: t("leases.new.steps.details.description"),
      icon: FaInfoCircle,
    },
    {
      title: t("leases.new.steps.rules.title"),
      description: t("leases.new.steps.rules.description"),
      icon: FaListUl,
    },
    {
      title: t("leases.new.steps.preview.title"),
      description: t("leases.new.steps.preview.description"),
      icon: FaFileSignature,
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
          "startDate",
          "endDate",
          "rentAmount",
          "depositAmount",
          "paymentDay",
          "tenantMode",
        ];
        if (formValues.tenantMode === "existing") {
          fieldsToValidate.push("tenantId");
        } else {
          fieldsToValidate.push("tenantName", "tenantEmail", "tenantPhone");
        }
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
    const isStepValid = await trigger(fieldsToValidate);
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
    if (isValid) {
      const formValues = methods.getValues();
      if (currentStep === 0 && formValues.hasExistingLease) {
        // Skip step 1 (rules) and go directly to step 2 if has existing lease
        setCurrentStep(2);
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("leases.errors.createFailed");
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <LeaseDetailsStep userId={_userId} userRole={_userRole} />;
      case 1:
        return <LeaseRulesStep />;
      case 2:
        return watch("hasExistingLease") ? (
          <LeaseUploadStep />
        ) : (
          <LeasePreviewStep />
        );
      default:
        return null;
    }
  };

  return (
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
              <div className="md:px-12">{renderStep()}</div>
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
                    Next
                  </Button>
                ) : (
                  <Button type="submit" isLoading={isSubmitting}>
                    Submit
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default NewLeaseClient;
