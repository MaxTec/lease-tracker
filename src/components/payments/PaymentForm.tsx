import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import DateInput from "@/components/ui/DateInput";
import Button from "../ui/Button";

const paymentFormSchema = z.object({
  paymentMethod: z.enum([
    "CASH",
    "BANK_TRANSFER",
    "CREDIT_CARD",
    "CHECK",
    "OTHER",
  ]),
  transactionId: z.string().optional(),
  paymentDate: z.string().refine((date) => {
    const selectedDate = new Date(date);
    return !isNaN(selectedDate.getTime());
  }, "Invalid date format"),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  onClose: () => void;
  leaseStartDate: string;
  lastPaymentDate?: string | null;
  initialData?: Partial<PaymentFormData>;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  onClose,
  leaseStartDate,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: initialData?.paymentMethod || "CASH",
      paymentDate:
        initialData?.paymentDate || new Date().toISOString().split("T")[0],
      transactionId: initialData?.transactionId,
    },
  });

  const paymentMethod = watch("paymentMethod");

  const validatePaymentDate = (date: string) => {
    const selectedDate = new Date(
      Date.UTC(
        new Date(date).getUTCFullYear(),
        new Date(date).getUTCMonth(),
        new Date(date).getUTCDate()
      )
    );
    selectedDate.setUTCHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setError("paymentDate", {
        message: "Payment date cannot be in the future",
      });
      return false;
    }

    // if (lastPaymentDate) {
    //   const lastPaymentUTC = new Date(
    //     Date.UTC(
    //       new Date(lastPaymentDate).getUTCFullYear(),
    //       new Date(lastPaymentDate).getUTCMonth(),
    //       new Date(lastPaymentDate).getUTCDate()
    //     )
    //   );
    //   if (selectedDate < lastPaymentUTC) {
    //     setError("paymentDate", {
    //       message: "Payment date cannot be before the last payment date",
    //     });
    //     return false;
    //   }
    // }

    const leaseStartUTC = new Date(
      Date.UTC(
        new Date(leaseStartDate).getUTCFullYear(),
        new Date(leaseStartDate).getUTCMonth(),
        new Date(leaseStartDate).getUTCDate()
      )
    );
    leaseStartUTC.setUTCHours(0, 0, 0, 0);

    if (selectedDate < leaseStartUTC) {
      setError("paymentDate", {
        message: "Payment date cannot be before the lease start date",
      });
      return false;
    }

    clearErrors("paymentDate");
    return true;
  };

  const handleFormSubmit = (data: PaymentFormData) => {
    if (validatePaymentDate(data.paymentDate)) {
      console.log("data", data);
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <DateInput
        label="Payment Date"
        {...register("paymentDate")}
        error={errors.paymentDate?.message}
        onChange={(value) => {
          validatePaymentDate(value);
        }}
      />

      <Select
        label="Payment Method"
        {...register("paymentMethod")}
        error={errors.paymentMethod?.message}
        options={[
          { value: "CASH", label: "Cash" },
          { value: "BANK_TRANSFER", label: "Bank Transfer" },
          { value: "CREDIT_CARD", label: "Credit Card" },
          { value: "CHECK", label: "Check" },
          { value: "OTHER", label: "Other" },
        ]}
      />

      {paymentMethod === "BANK_TRANSFER" && (
        <Input
          type="text"
          label="Transaction ID"
          {...register("transactionId")}
          error={errors.transactionId?.message}
        />
      )}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Confirm Payment
        </Button>
      </div>
    </form>
  );
};
