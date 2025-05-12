import NewLeaseClient from "./NewLeaseClient";
import Layout from "@/components/layout/Layout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function NewLeasePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id as string | undefined;
  const userRole = session?.user?.role as string | undefined;

  return (
    <Layout>
      <NewLeaseClient userId={userId} userRole={userRole} />
    </Layout>
  );
}
