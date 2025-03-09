'use client';

import { useState } from 'react';

interface PaymentFormData {
  leaseId: string;
  amount: string;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}

interface NewPaymentModalProps {
  onClose: () => void;
  onSubmit: (paymentData: PaymentFormData) => Promise<void>;
}

export default function NewPaymentModal({ onClose, onSubmit }: NewPaymentModalProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    leaseId: '',
    amount: '',
    dueDate: '',
    status: 'PENDING'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  return (
    <dialog
      id="newPaymentModal"
      className="modal p-6 rounded-lg shadow-xl max-w-2xl w-full"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Add New Payment</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lease ID
          </label>
          <input
            type="text"
            required
            value={formData.leaseId}
            onChange={(e) => setFormData({ ...formData, leaseId: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            required
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentFormData['status'] })}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Payment
          </button>
        </div>
      </form>
    </dialog>
  );
} 