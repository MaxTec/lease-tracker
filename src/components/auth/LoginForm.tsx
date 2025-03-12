"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { LoginInput, loginSchema } from "@/lib/validations/auth";

export default function LoginForm({
  onToggleForm,
}: {
  onToggleForm: () => void;
}) {
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
        throw new Error("Invalid email or password");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
        Welcome back
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
          label="E-mail Address"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" fullwidth disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
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
            Forgot password?
          </button>
          <span className="mx-2">|</span>
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={onToggleForm}
          >
            Don&apos;t you have an account?
          </button>
        </div>
      </form>
    </div>
  );
}
