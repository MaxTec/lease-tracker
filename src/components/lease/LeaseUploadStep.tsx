import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-hot-toast";

const LeaseUploadStep = () => {
  const { register, setValue, watch } = useFormContext();
  const signedLeaseFile = watch("signedLeaseFile");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.type === "application/pdf") {
          setValue("signedLeaseFile", file, { shouldValidate: true });
          toast.success("Lease agreement uploaded successfully");
        } else {
          toast.error("Please upload a PDF file");
        }
      }
    },
    [setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Upload Existing Lease Agreement
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Please upload your existing lease agreement in PDF format
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${signedLeaseFile ? "bg-green-50 border-green-500" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-3">
          <FiUpload
            className={`w-8 h-8 ${
              signedLeaseFile ? "text-green-500" : "text-gray-400"
            }`}
          />
          {signedLeaseFile ? (
            <>
              <p className="text-sm font-medium text-green-600">
                File uploaded successfully
              </p>
              <p className="text-xs text-gray-500">{signedLeaseFile.name}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">
                {isDragActive
                  ? "Drop the file here"
                  : "Drag & drop your lease agreement here"}
              </p>
              <p className="text-xs text-gray-500">or click to select a file</p>
            </>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>Accepted file type: PDF</p>
        <p>Maximum file size: 10MB</p>
      </div>
    </div>
  );
};

export default LeaseUploadStep;
