"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import { useTranslations } from "next-intl";

// Define type from schema
type TicketFormData = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
};

export default function CreateTicketButton() {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define the validation schema with translations
  const getTicketSchema = () => z.object({
    title: z.string().min(1, t("common.errors.required")).max(100, t("tickets.form.titleTooLong")),
    description: z.string().min(1, t("common.errors.required")),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TicketFormData>({
    resolver: zodResolver(getTicketSchema()),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
    },
  });

  const handleFormSubmit = async (data: TicketFormData) => {
    setLoading(true);

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(t("tickets.errors.createFailed"));
      }

      setOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)} className="mb-4">
        {t("tickets.create")}
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t("tickets.create")}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input
              label={t("tickets.form.title")}
              id="title"
              error={errors.title?.message}
              {...register("title")}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              label={t("tickets.form.description")}
              error={errors.description?.message}
              {...register("description")}
            />
          </div>
          <div className="space-y-2">
            <Select
              label={t("tickets.form.priority")}
              error={errors.priority?.message}
              {...register("priority")}
              options={[
                { value: "LOW", label: t("tickets.priority.low") },
                { value: "MEDIUM", label: t("tickets.priority.medium") },
                { value: "HIGH", label: t("tickets.priority.high") },
                { value: "URGENT", label: t("tickets.priority.urgent") },
              ]}
            />
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("common.loading") : t("common.buttons.create")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
