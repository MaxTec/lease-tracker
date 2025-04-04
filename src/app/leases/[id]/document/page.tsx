import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Layout from "@/components/layout/Layout";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function LeaseDocumentPage({ params }: PageProps) {
  const leaseId = parseInt(params.id);
  
  if (isNaN(leaseId)) {
    return notFound();
  }

  const document = await prisma.document.findFirst({
    where: {
      leaseId: leaseId,
      type: "LEASE_AGREEMENT",
    },
  });

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">No Document Found</h2>
          <p className="mt-2 text-gray-600">The lease agreement document is not available.</p>
        </div>
        </div>
    );
  }

  return (
    <Layout>
      <div className="w-full h-screen max-w-[860px] mx-auto">
        <iframe
          src={`${document.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-0"
          title="Lease Agreement Document"
          style={{ pointerEvents: 'none' }} // Disable controls
        />
      </div>
    </Layout>
  );
}
