"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClauseFormData, clauseFormSchema } from "@/lib/validations/lease";
import { ClauseType } from "@prisma/client";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

interface ClauseFormProps {
  onSubmit: (data: ClauseFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ClauseForm({ onSubmit, onCancel }: ClauseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClauseFormData>({
    resolver: zodResolver(clauseFormSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "OTHER",
    },
  });

  const handleFormSubmit = async (data: ClauseFormData) => {
    try {
      await onSubmit(data);
      reset(); // Reset form after successful submission
      onCancel();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Clause Title"
        placeholder="Clause Title"
        error={errors.title?.message}
        {...register("title")}
      />
      <Textarea
        label="Clause Content"
        placeholder="Clause Content"
        error={errors.content?.message}
        {...register("content")}
      />
      <Select
        label="Clause Type"
        error={errors.type?.message}
        {...register("type")}
        options={Object.values(ClauseType).map((type) => ({
          value: type,
          label: type,
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
          Add Clause
        </Button>
      </div>
    </form>
  );
} 