"use client";

import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import LeasePDF from "@/components/lease/LeasePDF";

export default function LeasePreviewStep() {
  const { watch } = useFormContext();
  const formData = watch();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Generate PDF preview when form data changes
    const generatePreview = async () => {
      try {
        const response = await fetch('/api/leases/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to generate preview');
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error('Error generating preview:', error);
      }
    };

    generatePreview();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [formData]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        Lease Agreement Preview
      </h3>
      
      <div className="border rounded-lg overflow-hidden">
        {pdfUrl ? (
          <LeasePDF url={pdfUrl} />
        ) : (
          <div className="p-4 text-center text-gray-500">
            Generating preview...
          </div>
        )}
      </div>
    </div>
  );
} 