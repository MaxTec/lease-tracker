import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Layout from "@/components/layout/Layout";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DateInput from "@/components/ui/DateInput";

// Define the validation schema using zod
const leaseSchema = z.object({
  unitId: z.string().nonempty("Unit is required"),
  tenantId: z.string().nonempty("Tenant is required"),
  startDate: z.string().nonempty("Start date is required"),
  endDate: z.string().nonempty("End date is required"),
  rentAmount: z.string().nonempty("Rent amount is required").transform(Number),
  depositAmount: z
    .string()
    .nonempty("Deposit amount is required")
    .transform(Number),
  paymentDay: z.string().nonempty("Payment day is required").transform(Number),
});

interface Property {
  id: number;
  name: string;
  units: Unit[];
}

interface Unit {
  id: number;
  unitNumber: string;
}

interface Tenant {
  id: number;
  user: {
    name: string;
  };
}

interface LeaseData {
  id: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  paymentDay: number;
  unit: {
    property: {
      name: string;
    };
    unitNumber: string;
  };
  tenant: {
    user: {
      name: string;
    };
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
});

export default function NewLeaseForm() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showPdf, setShowPdf] = useState(false);
  const [leaseData, setLeaseData] = useState<LeaseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaseSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesRes, tenantsRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/tenants"),
        ]);

        if (!propertiesRes.ok || !tenantsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData);
      } catch (err) {
        setError("Failed to load form data");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/leases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create lease");
      }

      const leaseData = await response.json();
      setLeaseData(leaseData);
      setShowPdf(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lease");
    } finally {
      setLoading(false);
    }
  };

  const LeaseAgreement = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Lease Agreement</Text>
        <Text style={styles.text}>This lease agreement is made between:</Text>
        <Text style={styles.text}>
          Landlord: {leaseData?.unit.property.name}
        </Text>
        <Text style={styles.text}>Tenant: {leaseData?.tenant.user.name}</Text>
        <Text style={styles.text}>
          Property: {leaseData?.unit.property.name} - Unit{" "}
          {leaseData?.unit.unitNumber}
        </Text>
        <Text style={styles.text}>
          Lease Period:{" "}
          {leaseData?.startDate
            ? new Date(leaseData.startDate).toLocaleDateString()
            : ""}{" "}
          to{" "}
          {leaseData?.endDate
            ? new Date(leaseData.endDate).toLocaleDateString()
            : ""}
        </Text>
        <Text style={styles.text}>Monthly Rent: ${leaseData?.rentAmount}</Text>
        <Text style={styles.text}>
          Security Deposit: ${leaseData?.depositAmount}
        </Text>
        <Text style={styles.text}>
          Payment Due Day: {leaseData?.paymentDay}
        </Text>
      </Page>
    </Document>
  );

  if (showPdf) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Lease Agreement</h2>
            <div className="h-[800px]">
              <PDFViewer width="100%" height="100%">
                <LeaseAgreement />
              </PDFViewer>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => router.push("/leases")}>
                Back to Leases
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Add New Lease</h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              <Input
                {...register("unitId")}
                label="Unit"
                error={errors.unitId?.message}
              />

              <Select
                {...register("tenantId")}
                label="Tenant"
                options={tenants.map((tenant) => ({
                  value: tenant.id.toString(),
                  label: tenant.user.name,
                }))}
                error={errors.tenantId?.message}
              />
     
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      label="Start Date"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.startDate?.message}
                    />
                  )}
                />

                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DateInput
                      label="End Date"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.endDate?.message}
                    />
                  )}
                />
              </div>

              <Input
                {...register("rentAmount")}
                label="Rent Amount"
                type="number"
                error={errors.rentAmount?.message}
              />

              <Input
                {...register("depositAmount")}
                label="Deposit Amount"
                type="number"
                error={errors.depositAmount?.message}
              />

              <Input
                {...register("paymentDay")}
                label="Payment Day"
                type="number"
                error={errors.paymentDay?.message}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/leases")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Lease"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
