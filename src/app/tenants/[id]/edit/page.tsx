"use client";

import TenantForm from "@/components/tenants/TenantForm";

export default function EditTenantPage({ params }: { params: { id: string } }) {
  return <TenantForm tenantId={parseInt(params.id)} />;
} 