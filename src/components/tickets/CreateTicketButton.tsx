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

// Define the validation schema
const ticketSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

// Define type from schema
type TicketFormData = z.infer<typeof ticketSchema>;

export default function CreateTicketButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
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
        throw new Error("Failed to create ticket");
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
        Create Support Ticket
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create Support Ticket"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input
              label="Title"
              id="title"
              error={errors.title?.message}
              {...register("title")}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              label="Description"
              error={errors.description?.message}
              {...register("description")}
            />
          </div>
          <div className="space-y-2">
            <Select
              label="Priority"
              error={errors.priority?.message}
              {...register("priority")}
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
