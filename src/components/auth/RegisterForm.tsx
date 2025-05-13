"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Checkbox from "../ui/Checkbox";
import { RegisterInput, registerSchema } from "@/lib/validations/auth";
import { useTranslations } from "next-intl";

export default function RegisterForm({ onToggleForm }: { onToggleForm: () => void }) {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(null);

      // Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("common.errors.serverError"));
      }

      // Sign in the user
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(t("common.errors.serverError"));
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.errors.serverError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-md w-full mx-auto'>
      <h2 className='text-2xl font-semibold text-gray-800 mb-8 text-center'>{t("auth.register.title")}</h2>

      <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
        {error && <div className='bg-red-50 text-red-600 p-3 rounded-md text-sm'>{error}</div>}

        <Input id='name' label={t("auth.register.name")} placeholder={t("auth.register.name")} error={errors.name?.message} {...register("name")} />

        <Input id='email' type='email' label={t("auth.register.email")} placeholder={t("auth.register.email")} error={errors.email?.message} {...register("email")} />

        <Input
          id='password'
          type='password'
          label={t("auth.register.password")}
          placeholder={t("auth.register.password")}
          error={errors.password?.message}
          {...register("password")}
        />

        {/* <Input
          id='confirmPassword'
          type='password'
          label={t("auth.register.confirmPassword")}
          placeholder={t("auth.register.confirmPassword")}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        /> */}

        <Checkbox
          id='terms'
          label={
            <>
              {t("auth.register.termsText", {
                termsLink: t("auth.register.termsLink"),
              })}
              <span className='text-blue-600 hover:underline cursor-pointer'>{t("auth.register.termsLink")}</span>
            </>
          }
          error={errors.terms?.message}
          {...register("terms")}
        />

        <div className='flex flex-col sm:flex-row gap-4'>
          <Button type='submit' fullwidth disabled={isLoading}>
            {isLoading ? t("common.loading") : t("auth.register.registerButton")}
          </Button>
        </div>

        <div className='flex justify-center items-center mt-4'>
          <span className='text-sm text-gray-600'>{t("auth.register.haveAccount")}</span>
          <button type='button' className='text-sm text-blue-600 hover:underline ml-2' onClick={onToggleForm}>
            {t("auth.login.loginButton")}
          </button>
        </div>
      </form>
    </div>
  );
}
