'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

interface Lease {
  id: number;
  unit: {
    unitNumber: string;
    property: {
      name: string;
    };
  };
  tenant: {
    user: {
      name: string;
    };
  };
}

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const paymentSchema = z.object({
  leaseId: z.string().min(1, 'Lease is required'),
  amount: z.string().min(1, 'Amount is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER']).optional(),
  transactionId: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function NewPaymentModal({ isOpen, onClose, onSuccess }: NewPaymentModalProps) {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      status: 'PENDING',
    },
  });

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const response = await fetch('/api/leases');
        if (!response.ok) throw new Error('Failed to fetch leases');
        const data = await response.json();
        setLeases(data);
      } catch (err) {
        console.error('Error fetching leases:', err);
      }
    };

    if (isOpen) {
      fetchLeases();
    }
  }, [isOpen]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          leaseId: parseInt(data.leaseId),
          amount: parseFloat(data.amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      reset();
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lease
            </label>
            <select
              {...register('leaseId')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a lease</option>
              {leases.map((lease) => (
                <option key={lease.id} value={lease.id}>
                  {lease.tenant.user.name} - {lease.unit.property.name} Unit {lease.unit.unitNumber}
                </option>
              ))}
            </select>
            {errors.leaseId && (
              <p className="text-red-500 text-sm mt-1">{errors.leaseId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              {...register('amount')}
              className="w-full p-2 border rounded-md"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full p-2 border rounded-md"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full p-2 border rounded-md"
            >
              {Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              {...register('paymentMethod')}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select payment method</option>
              {Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>
                  {method.replace('_', ' ')}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID (Optional)
            </label>
            <input
              type="text"
              {...register('transactionId')}
              className="w-full p-2 border rounded-md"
            />
            {errors.transactionId && (
              <p className="text-red-500 text-sm mt-1">{errors.transactionId.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 