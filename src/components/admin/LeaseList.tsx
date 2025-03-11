'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

interface Lease {
  id: number;
  tenant: {
    user: {
      name: string;
    };
  };
  unit: {
    unitNumber: string;
    property: {
      name: string;
    };
  };
  startDate: string;
  endDate: string;
  rentAmount: number;
  _count?: {
    payments: number;
  };
  overdueMonths?: number;
}

export default function LeaseList() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/leases?include=payments');
        if (!response.ok) throw new Error('Failed to fetch leases');
        const data = await response.json();
        setLeases(data);
      } catch (err) {
        console.error('Error fetching leases:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch leases');
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  const columns = [
    {
      key: 'id',
      label: 'Lease ID'
    },
    {
      key: 'tenant.user.name',
      label: 'Tenant',
      sortable: true,
    },
    {
      key: 'unit',
      label: 'Property',
      sortable: true,
      render: (lease: Lease) => `${lease.unit.property.name} - Unit ${lease.unit.unitNumber}`,
    },
    {
      key: '_count.payments',
      label: 'Payments',
      sortable: true,
      render: (lease: Lease) => lease._count?.payments || 0,
    },
    {
      key: 'overdueMonths',
      label: 'Overdue Months',
      sortable: true,
      render: (lease: Lease) => (
        lease.overdueMonths ? (
          <Badge status="error">
            {lease.overdueMonths} months
          </Badge>
        ) : (
          <Badge status="success">
            Up to date
          </Badge>
        )
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (lease: Lease) => (
        <div className="space-x-2">
          <Link
            href={`/payments?leaseId=${lease.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Button
              variant="secondary"
              size="sm"
            >
              {/* View Payments */}
              <FaEye className="inline-block align-middle" />
            </Button>
          </Link>
          <Button
            onClick={() => {/* TODO: Add edit handler */}}
            variant="outline"
            size="sm"
          >
            {/* Edit */}
            <FaEdit className="inline-block align-middle" />
          </Button>
          <Button
            onClick={() => {/* TODO: Add delete handler */}}
            variant="danger"
            size="sm"
          >
            {/* Delete */}
            <FaTrash className="inline-block align-middle" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Active Leases</h2>
          <Button
            onClick={() => {/* TODO: Add new lease handler */}}
          >
            <FaPlus className="mr-2 inline-block align-middle" />
            <span className="align-middle">Add New Contract</span>
          </Button>
        </div>

        <Table
          data={leases}
          columns={columns}
          searchable={true}
          searchKeys={['id', 'tenant.user.name', 'unit.property.name', 'unit.unitNumber']}
          pageSize={10}
        />
      </div>
    </div>
  );
} 