"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RuleFormData } from "@/lib/validations/lease";
import { createRuleSchema } from "@/lib/validations/rules";
import { RuleCategory } from "@prisma/client";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

interface RuleFormProps {
  onSubmit: (data: RuleFormData) => Promise<void>;
  onCancel: () => void;
}

export default function RuleForm({ onSubmit, onCancel }: RuleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RuleFormData>({
    resolver: zodResolver(createRuleSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "OTHER",
    },
  });

  const handleFormSubmit = async (data: RuleFormData) => {
    try {
      await onSubmit(data);
      reset(); // Reset form after successful submission
      onCancel();
    } catch (error) {
      console.error(error);
      // Error handling is done in the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Rule Title"
        placeholder="Rule Title"
        error={errors.title?.message}
        {...register("title")}
      />
      <Textarea
        label="Rule Description"
        placeholder="Rule Description"
        error={errors.description?.message}
        {...register("description")}
      />
      <Select
        label="Rule Category"
        error={errors.category?.message}
        {...register("category")}
        options={Object.values(RuleCategory).map((category) => ({
          value: category,
          label: category,
        }))}
      />
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Add Rule
        </Button>
      </div>
    </form>
  );
}
