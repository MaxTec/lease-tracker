"use client";

import PropertyForm from "@/components/properties/PropertyForm";

export default function EditPropertyPage({ params }: { params: { id: string } }) {
  return <PropertyForm propertyId={parseInt(params.id)} />;
} 