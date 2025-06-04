"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { LoginInput, loginSchema } from "@/lib/validations/auth";
import { useTranslations } from 'next-intl';

export default function LoginForm() {
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(t('common.errors.invalidCredentials'));
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.errors.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
        {t('auth.login.title')}
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Input
          id="email"
          type="email"
          label={t('auth.login.email')}
          placeholder={t('auth.login.email')}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="password"
          type="password"
          label={t('auth.login.password')}
          placeholder={t('auth.login.password')}
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" fullwidth disabled={isLoading}>
            {isLoading ? t('common.loading') : t('auth.login.loginButton')}
          </Button>
        </div>
        <div className="flex justify-center items-center">
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => {
              /* Add forgot password handler */
            }}
          >
            {t('auth.login.forgotPassword')}
          </button>
        </div>
      </form>
    </div>
  );
}
