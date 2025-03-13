import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import { PDFViewer, Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

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

interface FormData {
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
  depositAmount: string;
  paymentDay: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
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
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showPdf, setShowPdf] = useState(false);
  const [leaseData, setLeaseData] = useState<LeaseData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    unitId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    rentAmount: '',
    depositAmount: '',
    paymentDay: '1',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesRes, tenantsRes] = await Promise.all([
          fetch('/api/properties'),
          fetch('/api/tenants'),
        ]);

        if (!propertiesRes.ok || !tenantsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [propertiesData, tenantsData] = await Promise.all([
          propertiesRes.json(),
          tenantsRes.json(),
        ]);

        setProperties(propertiesData);
        setTenants(tenantsData);
      } catch (err) {
        setError('Failed to load form data');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create lease');
      }

      const data = await response.json();
      setLeaseData(data);
      setShowPdf(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lease');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const LeaseAgreement = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Lease Agreement</Text>
        <Text style={styles.text}>This lease agreement is made between:</Text>
        <Text style={styles.text}>Landlord: {leaseData?.unit.property.name}</Text>
        <Text style={styles.text}>Tenant: {leaseData?.tenant.user.name}</Text>
        <Text style={styles.text}>Property: {leaseData?.unit.property.name} - Unit {leaseData?.unit.unitNumber}</Text>
        <Text style={styles.text}>
          Lease Period: {leaseData?.startDate ? new Date(leaseData.startDate).toLocaleDateString() : ''} to {leaseData?.endDate ? new Date(leaseData.endDate).toLocaleDateString() : ''}
        </Text>
        <Text style={styles.text}>Monthly Rent: ${leaseData?.rentAmount}</Text>
        <Text style={styles.text}>Security Deposit: ${leaseData?.depositAmount}</Text>
        <Text style={styles.text}>Payment Due Day: {leaseData?.paymentDay}</Text>
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
              <Button onClick={() => router.push('/leases')}>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Property Unit
                </label>
                <select
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a unit</option>
                  {properties.map(property => (
                    property.units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {property.name} - Unit {unit.unitNumber}
                      </option>
                    ))
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tenant
                </label>
                <select
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Monthly Rent
                  </label>
                  <input
                    type="number"
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Security Deposit
                  </label>
                  <input
                    type="number"
                    name="depositAmount"
                    value={formData.depositAmount}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Due Day (1-31)
                </label>
                <input
                  type="number"
                  name="paymentDay"
                  value={formData.paymentDay}
                  onChange={handleChange}
                  required
                  min="1"
                  max="31"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/leases')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Lease'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 