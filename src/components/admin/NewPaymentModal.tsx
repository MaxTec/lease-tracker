'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { format, setDate, differenceInDays, isAfter } from 'date-fns';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import FormGroup from '@/components/ui/FormGroup';
import DateInput from '@/components/ui/DateInput';

interface LastPayment {
  id: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
}

interface Lease {
  id: number;
  rentAmount: number;
  paymentDay: number;
  unit: {
    unitNumber: string;
    property: {
      name: string;
    };
  };
  tenant: {
    id: number;
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
  const [lastPayment, setLastPayment] = useState<LastPayment | null>(null);
  const [overdueInfo, setOverdueInfo] = useState<{ days: number; amount: number } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      status: 'PENDING',
    },
  });

  // Watch for changes in leaseId
  const selectedLeaseId = watch('leaseId');

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
      // Reset last payment and overdue info when modal opens
      setLastPayment(null);
      setOverdueInfo(null);
    }
  }, [isOpen]);

  // Update amount and due date when lease is selected
  useEffect(() => {
    if (selectedLeaseId) {
      const selectedLease = leases.find(lease => lease.id.toString() === selectedLeaseId);
      if (selectedLease) {
        // Set the amount to the lease's rent amount
        setValue('amount', selectedLease.rentAmount.toString());

        // Fetch the last payment for this lease
        const fetchLastPayment = async () => {
          try {
            const response = await fetch(`/api/payments?leaseId=${selectedLeaseId}`);
            if (!response.ok) throw new Error('Failed to fetch last payment');
            const lastPaymentData = await response.json();

            if (lastPaymentData) {
              setLastPayment(lastPaymentData);
              
              // Calculate overdue information
              const dueDate = new Date(lastPaymentData.dueDate);
              const today = new Date();
              
              if (lastPaymentData.status !== 'PAID' && isAfter(today, dueDate)) {
                setOverdueInfo({
                  days: differenceInDays(today, dueDate),
                  amount: lastPaymentData.amount
                });
              } else {
                setOverdueInfo(null);
              }
            } else {
              setLastPayment(null);
              setOverdueInfo(null);
            }

            // Calculate the next due date
            const today = new Date();
            let nextDueDate: Date;

            if (lastPaymentData) {
              // Get the last payment's due date
              const lastDueDate = new Date(lastPaymentData.dueDate);
              
              // Set the next due date to one month after the last due date
              nextDueDate = new Date(lastDueDate);
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);

              // If the calculated next due date is in the past, increment by months until it's in the future
              while (nextDueDate < today) {
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              }
            } else {
              // If no previous payments, calculate based on payment day
              nextDueDate = setDate(today, selectedLease.paymentDay);
              if (today.getDate() > selectedLease.paymentDay) {
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              }
            }

            // Set the due date
            setValue('dueDate', format(nextDueDate, 'yyyy-MM-dd'));
          } catch (err) {
            console.error('Error fetching last payment:', err);
            setLastPayment(null);
            setOverdueInfo(null);
            // Fallback to original calculation if fetch fails
            const today = new Date();
            const nextDueDate = setDate(today, selectedLease.paymentDay);
            if (today.getDate() > selectedLease.paymentDay) {
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            }
            setValue('dueDate', format(nextDueDate, 'yyyy-MM-dd'));
          }
        };

        fetchLastPayment();
      }
    } else {
      // Reset last payment and overdue info when no lease is selected
      setLastPayment(null);
      setOverdueInfo(null);
    }
  }, [selectedLeaseId, leases, setValue]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Find the selected lease to get the tenant ID
      const selectedLease = leases.find(lease => lease.id.toString() === data.leaseId);
      if (!selectedLease) {
        throw new Error('Selected lease not found');
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          leaseId: parseInt(data.leaseId),
          tenantId: selectedLease.tenant.id,
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

  // Convert leases to options format for Select component
  const leaseOptions = leases.map(lease => ({
    value: lease.id.toString(),
    label: `${lease.tenant.user.name} - ${lease.unit.property.name} Unit ${lease.unit.unitNumber}`
  }));

  // Convert payment status to options
  const statusOptions = Object.values(PaymentStatus).map(status => ({
    value: status,
    label: status
  }));

  // Convert payment methods to options
  const methodOptions = Object.values(PaymentMethod).map(method => ({
    value: method,
    label: method.replace('_', ' ')
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Payment">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {selectedLeaseId && (lastPayment || overdueInfo) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Payment History</h3>
          
          {lastPayment && (
            <div className="mb-3">
              <h4 className="font-medium text-gray-700">Last Payment</h4>
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 font-medium">${lastPayment.amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${
                    lastPayment.status === 'PAID' ? 'text-green-600' :
                    lastPayment.status === 'OVERDUE' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {lastPayment.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2">{format(new Date(lastPayment.dueDate), 'MMM dd, yyyy')}</span>
                </div>
                {lastPayment.paidDate && (
                  <div>
                    <span className="text-gray-600">Paid Date:</span>
                    <span className="ml-2">{format(new Date(lastPayment.paidDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {overdueInfo && (
            <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
              <h4 className="font-medium text-red-700">Overdue Payment</h4>
              <div className="text-sm mt-2">
                <p className="text-red-600">
                  Payment is overdue by {overdueInfo.days} days
                </p>
                <p className="text-red-600 mt-1">
                  Outstanding amount: ${overdueInfo.amount.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <Select
            label="Lease"
            options={leaseOptions}
            error={errors.leaseId?.message}
            {...register('leaseId')}
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            error={errors.amount?.message}
            {...register('amount')}
          />

          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Due Date"
                value={field.value}
                onChange={field.onChange}
                error={errors.dueDate?.message}
              />
            )}
          />

          <Select
            label="Status"
            options={statusOptions}
            error={errors.status?.message}
            {...register('status')}
          />

          <Select
            label="Payment Method"
            options={methodOptions}
            error={errors.paymentMethod?.message}
            {...register('paymentMethod')}
          />

          <Input
            label="Transaction ID (Optional)"
            error={errors.transactionId?.message}
            {...register('transactionId')}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
            >
              Create Payment
            </Button>
          </div>
        </FormGroup>
      </form>
    </Modal>
  );
} 