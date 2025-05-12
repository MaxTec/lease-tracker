import Layout from "@/components/layout/Layout";
import { useTranslations } from "next-intl";
import Contact from './Contact';

export default function ContactPage() {
  const t = useTranslations();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t("contact.title")}</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-6">
              {t("contact.description")}
            </p>
            <Contact />
          </div>
        </div>
      </div>
    </Layout>
  );
}
