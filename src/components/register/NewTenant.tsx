"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormGroup from "@/components/ui/FormGroup";
import Notification from "@/components/ui/Notification";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";

const NewTenant: React.FC = () => {
  const t = useTranslations("registration");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const getRegistrationSchema = (t: ReturnType<typeof useTranslations>) =>
    z
      .object({
        phone: z.string().min(8, t("errorPhoneRequired")),
        password: z.string().min(8, t("errorPasswordMin")),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: t("errorPasswordsDontMatch"),
        path: ["confirmPassword"],
      });

  type RegistrationFormValues = z.infer<ReturnType<typeof getRegistrationSchema>>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(getRegistrationSchema(t)),
    mode: "onTouched",
  });

  useEffect(() => {
    if (success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [success]);

  const handleFormSubmit = async (data: RegistrationFormValues) => {
    setServerError("");
    try {
      const res = await fetch("/api/register/new-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
          phone: data.phone,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error || t("error.generic"));
      } else {
        setSuccess(true);
        reset();
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setServerError(t("error.network"));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      {serverError && (
        <Notification
          type="error"
          title={t("errorTitle")}
          message={serverError}
          onClose={() => setServerError("")}
        />
      )}
      {success && (
        <Notification
          type="success"
          title={t("successTitle")}
          message={t("successMessage")}
          onClose={() => setSuccess(false)}
        />
      )}
      {!success && (
        <form onSubmit={handleSubmit(handleFormSubmit)} aria-label={t("formAriaLabel")}> 
          <FormGroup>
            <Input
              label={t("phone")}
              type="tel"
              autoComplete="tel"
              aria-required="true"
              aria-label={t("phone")}
              {...register("phone")}
              error={errors.phone?.message}
            />
            <Input
              label={t("password")}
              type="password"
              autoComplete="new-password"
              aria-required="true"
              aria-label={t("password")}
              {...register("password")}
              error={errors.password?.message}
            />
            <Input
              label={t("confirmPassword")}
              type="password"
              autoComplete="new-password"
              aria-required="true"
              aria-label={t("confirmPassword")}
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
            <Button
              type="submit"
              variant="primary"
              fullwidth
              isLoading={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </FormGroup>
        </form>
      )}
    </div>
  );
};

export default NewTenant; 