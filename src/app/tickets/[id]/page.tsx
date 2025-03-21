import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TicketDetails from "@/components/tickets/TicketDetails";
import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
interface Props {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(params.id) },
    select: { title: true },
  });

  if (!ticket) {
    return {
      title: "Ticket Not Found | Lease Tracker",
    };
  }

  return {
    title: `${ticket.title} | Support Ticket | Lease Tracker`,
  };
}

export default async function TicketPage({ params }: Props) {
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
      <TicketDetails ticket={ticket} />
    </Layout>
  );
}
