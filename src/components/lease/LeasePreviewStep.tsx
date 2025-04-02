"use client";

import { useFormContext } from "react-hook-form";
import { useState, useEffect } from "react";
import LeasePDF from "@/components/lease/LeasePDF";
import { LeaseData } from "./LeasePDF";

export default function LeasePreviewStep() {
  const {
    watch,
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const formData = watch();
  const [pdfData, setPdfData] = useState<LeaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/leases/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to fetch preview data");

        const data = await response.json();
        setPdfData(data);
      } catch (error) {
        console.error("Error fetching preview data:", error);
        setError("Failed to load preview");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviewData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("signedLeaseFile", file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Generating preview...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <LeasePDF data={pdfData} />
        )}
      </div>

      <div className="mt-6 space-y-4">
        {/* Agreement Verified */}
        <div className="text-center flex flex-col items-center">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register("agreementVerified")}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">
              I have reviewed the lease agreement and confirm all information is
              correct
            </span>
          </label>
          {errors.agreementVerified && (
            <p className="mt-1 text-sm text-red-600">
              {errors.agreementVerified.message as string}
            </p>
          )}
        </div>
        <div className="text-center flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-700">
            Upload Signed Lease Agreement (Optional)
          </label>
          <div className="my-1">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/90"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 text-center">
            Upload the scanned copy of the signed lease agreement (PDF format
            only)
          </p>
        </div>
      </div>
    </div>
  );
}
