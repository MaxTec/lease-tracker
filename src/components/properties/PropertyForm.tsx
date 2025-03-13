import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface Property {
  id?: number;
  name: string;
  address: string;
  type: string;
  landlordId: number;
}

interface Landlord {
  id: number;
  user: {
    name: string;
  };
}

export default function PropertyForm({ propertyId }: { propertyId?: number }) {
  const router = useRouter();
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [formData, setFormData] = useState<Property>({
    name: '',
    address: '',
    type: '',
    landlordId: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<{ unitNumber: string; bedrooms: number; bathrooms: number; squareFeet: number }[]>([
    { unitNumber: '', bedrooms: 0, bathrooms: 0, squareFeet: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch landlords
        const landlordsRes = await fetch('/api/landlords');
        if (!landlordsRes.ok) throw new Error('Failed to fetch landlords');
        const landlordsData = await landlordsRes.json();
        setLandlords(landlordsData);

        // If editing, fetch property data
        if (propertyId) {
          const propertyRes = await fetch(`/api/properties/${propertyId}`);
          if (!propertyRes.ok) throw new Error('Failed to fetch property');
          const propertyData = await propertyRes.json();
          setFormData(propertyData);
        }
      } catch (err) {
        setError('Failed to load form data');
        console.error(err);
      }
    };

    fetchData();
  }, [propertyId]);

  const handleUnitChange = (index: number, field: string, value: string | number) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  const addUnit = () => {
    if (units.length < 5) {
      setUnits([...units, { unitNumber: '', bedrooms: 0, bathrooms: 0, squareFeet: 0 }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = propertyId ? `/api/properties/${propertyId}` : '/api/properties';
      const method = propertyId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, units }),
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      router.push('/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">
              {propertyId ? 'Edit Property' : 'Add New Property'}
            </h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  id="name"
                  name="name"
                  label="Property Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  id="address"
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Select
                  name="type"
                  label="Property Type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  options={[
                    { value: 'APARTMENT', label: 'Apartment' },
                    { value: 'HOUSE', label: 'House' },
                    { value: 'COMMERCIAL', label: 'Commercial' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                >
                </Select>
              </div>

              <div>
                <Select
                  options={landlords.map(landlord => ({
                    value: landlord.id.toString(),
                    label: landlord.user.name
                  }))}
                  label="Landlord"
                  name="landlordId"
                  value={formData.landlordId}
                  onChange={handleChange}
                  required
                >
                  
                </Select>
              </div>

              <div>
                <h3 className="text-lg font-medium">Units</h3>
                {units.map((unit, index) => (
                  <div key={index} className="mb-4">
                    <Input
                      id={`unitNumber-${index}`}
                      name="unitNumber"
                      label="Unit Number"
                      value={unit.unitNumber}
                      onChange={(e) => handleUnitChange(index, 'unitNumber', e.target.value)}
                    />
                    <Input
                      id={`bedrooms-${index}`}
                      name="bedrooms"
                      label="Bedrooms"
                      type="number"
                      value={unit.bedrooms}
                      onChange={(e) => handleUnitChange(index, 'bedrooms', Number(e.target.value))}
                    />
                    <Input
                      id={`bathrooms-${index}`}
                      name="bathrooms"
                      label="Bathrooms"
                      type="number"
                      value={unit.bathrooms}
                      onChange={(e) => handleUnitChange(index, 'bathrooms', Number(e.target.value))}
                    />
                    <Input
                      id={`squareFeet-${index}`}
                      name="squareFeet"
                      label="Square Feet"
                      type="number"
                      value={unit.squareFeet}
                      onChange={(e) => handleUnitChange(index, 'squareFeet', Number(e.target.value))}
                    />
                  </div>
                ))}
                <button type="button" onClick={addUnit} className="text-blue-500">
                  Add Unit
                </button>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/properties')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : propertyId ? 'Update Property' : 'Create Property'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 