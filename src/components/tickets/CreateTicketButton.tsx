"use client";
import { useState, useEffect, useCallback } from "react";
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
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { uploadImageToR2 } from "@/utils/imageUtils";

// Define type from schema
type TicketImageForm = {
  url: string;
  altText?: string;
};

type TicketFormData = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  images: TicketImageForm[];
};

export default function CreateTicketButton() {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const [formError, setFormError] = useState<string | null>(null);
  const [images, setImages] = useState<TicketImageForm[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  useEffect(() => {
    if (session?.user?.role) {
       
      console.log("User role:", session.user.role);
    }
  }, [session?.user?.role]);

  // Define the validation schema with translations
  const getTicketSchema = () =>
    z.object({
      title: z
        .string()
        .min(1, t("common.errors.required"))
        .max(100, t("tickets.form.titleTooLong")),
      description: z.string().min(1, t("common.errors.required")),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
      images: z
        .array(
          z.object({
            url: z
              .string()
              .url(t("common.errors.invalidUrl"))
              .min(1, t("common.errors.required")),
            altText: z.string().optional(),
          })
        )
        .default([]),
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
      images: [],
    },
  });

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploadError(null);
      if (images.length + acceptedFiles.length > MAX_IMAGES) {
        setUploadError(t("common.errors.maxImages", { max: MAX_IMAGES }));
        return;
      }
      setUploading(true);
      try {
        for (const file of acceptedFiles) {
          if (!file.type.startsWith("image/")) {
            setUploadError(t("common.errors.invalidFileType"));
            continue;
          }
          if (file.size > MAX_FILE_SIZE) {
            setUploadError(t("common.errors.maxFileSize", { max: "2MB" }));
            continue;
          }
          const timestamp = Date.now();
          const fileName = `${timestamp}_${file.name}`;
          const url = await uploadImageToR2(file, fileName);
          setImages((prev) => [...prev, { url, altText: "" }]);
        }
      } catch {
        setUploadError(t("tickets.errors.createFailed"));
      } finally {
        setUploading(false);
      }
    },
    [t, images.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { "image/*": [] },
    multiple: true,
    disabled: images.length >= MAX_IMAGES,
  });

  const handleFormSubmit = async (data: TicketFormData) => {
    setLoading(true);
    setFormError(null); // Clear previous errors

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images: images.filter((img) => img.url),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("tickets.errors.createFailed"));
      }

      setOpen(false);
      reset();
      setImages([]);
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : t("tickets.errors.createFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {session?.user?.role !== "ADMIN" && (
        <Button onClick={() => setOpen(true)} className="mb-4">
          {t("tickets.create")}
        </Button>
      )}
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
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="images"
            >
              {t("tickets.form.attachments")} ({t("common.optional")})
            </label>
            <div
              {...getRootProps()}
              className={
                `border-2 border-dashed rounded-md p-4 min-h-[96px] flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ` +
                (isDragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-white")
              }
              tabIndex={0}
              aria-label={t("tickets.form.attachments")}
            >
              <input
                {...getInputProps()}
                aria-label={t("tickets.form.attachments") + " input"}
              />
              {images.length === 0 ? (
                <span>
                  {isDragActive
                    ? t("common.dropHere")
                    : t("common.dragDropOrClick")}
                </span>
              ) : (
                <div className="flex flex-wrap md:flex-nowrap gap-4 w-full justify-center">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        key={idx}
                        src={img.url}
                        alt={`Ticket image ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        aria-label={t("common.buttons.remove")}
                        tabIndex={0}
                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-red-100 hover:text-red-600 focus:outline-none"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {uploading && (
                <div className="text-blue-600 mt-2">
                  {t("common.uploading")}
                </div>
              )}
              {uploadError && (
                <div className="text-red-600 mt-2">{uploadError}</div>
              )}
            </div>
          </div>
          {formError && (
            <div className="text-red-600 text-sm mb-2" role="alert">
              {formError}
            </div>
          )}
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
