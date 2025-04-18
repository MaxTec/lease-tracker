import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TicketDetails from "@/components/tickets/TicketDetails";
import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import { getTranslations } from "next-intl/server";

interface Props {
  params: {
    id: string;
    locale: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({locale: params.locale, namespace: "tickets"});
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(params.id) },
    select: { title: true },
  });

  if (!ticket) {
    return {
      title: `${t("details")} | ${t("title")}`,
    };
  }

  return {
    title: `${ticket.title} | ${t("details")}`,
  };
}

export default async function TicketPage({ params }: Props) {
  const t = await getTranslations({locale: params.locale, namespace: "tickets"});
  
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: parseInt(params.id),
    },
    include: {
      property: true,
      unit: true,
      tenant: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      comments: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t("details")}</h1>
        <TicketDetails ticket={ticket} />
      </div>
    </Layout>
  );
}
