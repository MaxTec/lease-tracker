import { useTranslations } from "next-intl";
import Link from "next/link";
import type { FC } from "react";
import Image from "next/image";

import notFoundImage from "@public/not-found-doodle.png";
import EvictionPatternBackground from "@/components/EvictionPatternBackground";

const NotFoundPage: FC = () => {
  const t = useTranslations("NotFoundPage");

  return (
    <>
      <EvictionPatternBackground />
      <main
        className="flex flex-col items-center justify-center min-h-screen px-4m z-10 relative"
        aria-label={t("ariaLabel")}
      >
        <h1
          className="text-5xl font-bold text-gray-900 mb-4"
          tabIndex={0}
          aria-label={t("title")}
        >
          {t("title")}
        </h1>
        <p
          className="text-lg text-gray-600 mb-8"
          tabIndex={0}
          aria-label={t("description")}
        >
          {t("description")}
        </p>
        <Image src={notFoundImage} alt="404" width={300} height={300} />
        <p
          className="text-lg text-gray-600 mb-8"
          tabIndex={0}
          aria-label={t("description")}
        >
          {t("joke")}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
          aria-label={t("backToHome")}
          tabIndex={0}
        >
          {t("backToHome")}
        </Link>
      </main>
    </>
  );
};

export default NotFoundPage;
