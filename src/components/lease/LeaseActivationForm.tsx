import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiX, FiFile } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";

interface LeaseActivationFormProps {
  leaseId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  signedLeaseFile: File | null;
}

export default function LeaseActivationForm({
  leaseId,
  onSuccess,
  onCancel,
}: LeaseActivationFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      signedLeaseFile: null,
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type === "application/pdf") {
          setValue("signedLeaseFile", file);
          setSelectedFile(file);
          toast.success("Lease agreement uploaded successfully");
        } else {
          toast.error("Please upload a PDF file");
        }
      }
    },
    [setValue]
  );

  const removeFile = useCallback(() => {
    setValue("signedLeaseFile", null);
    setSelectedFile(null);
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (!data.signedLeaseFile) {
        toast.error("Please upload a signed lease file");
        return;
      }

      // Create form data with the file
      const formData = new FormData();
      formData.append("signedLeaseFile", data.signedLeaseFile);
      formData.append("data", JSON.stringify({ status: "ACTIVE" }));

      const response = await fetch(`/api/leases/${leaseId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to activate lease");
      }

      toast.success("Lease activated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error activating lease:", error);
      toast.error("Failed to activate lease. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        {selectedFile ? (
          <div className="border-2 border-green-500 bg-green-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiFile className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 hover:bg-green-100 rounded-full transition-colors"
                aria-label="Remove file"
              >
                <FiX className="w-5 h-5 text-green-600" />
              </button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-3">
              <FiUpload className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">
                {isDragActive
                  ? "Drop the file here"
                  : "Drag & drop your signed lease agreement here"}
              </p>
              <p className="text-xs text-gray-500">or click to select a file</p>
            </div>
          </div>
        )}
        <div className="mt-2 text-sm text-gray-500">
          <p>Accepted file type: PDF</p>
          <p>Maximum file size: 10MB</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedFile}>
          {isSubmitting ? "Activating..." : "Activate Lease"}
        </Button>
      </div>
    </form>
  );
} 