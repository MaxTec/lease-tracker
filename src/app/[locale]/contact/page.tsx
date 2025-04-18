"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormGroup from "@/components/ui/FormGroup";
import { useTranslations } from "next-intl";

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactPage() {
  const t = useTranslations();

  // Define the validation schema with translations
  const contactFormSchema = z.object({
    name: z.string().min(2, t("contact.form.validation.nameRequired")),
    email: z.string().email(t("contact.form.validation.emailRequired")),
    subject: z.string().min(5, t("contact.form.validation.subjectRequired")),
    message: z.string().min(10, t("contact.form.validation.messageRequired")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Here you would typically send the data to your API
      console.log("Form submitted:", data);
      reset();
      alert(t("contact.form.success"));
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(t("contact.form.error"));
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t("contact.title")}</h1>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-6">
              {t("contact.description")}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormGroup>
                <Input
                  label={t("contact.form.name")}
                  id="name"
                  type="text"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </FormGroup>

              <FormGroup>
                <Input
                  label={t("contact.form.email")}
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </FormGroup>

              <FormGroup>
                <Input
                  label={t("contact.form.subject")}
                  id="subject"
                  type="text"
                  {...register("subject")}
                  className={errors.subject ? "border-red-500" : ""}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.subject.message}
                  </p>
                )}
              </FormGroup>

              <FormGroup>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("contact.form.message")}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  {...register("message")}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.message.message}
                  </p>
                )}
              </FormGroup>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t("contact.form.sending") : t("contact.form.send")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
