'use client';

import { useState, useEffect } from 'react';
import { Payment } from '@/types/payment';

interface PaymentModalProps {
  payment?: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Payment>) => Promise<void>;
}

export default function PaymentModal({ payment, isOpen, onClose, onSubmit }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: '',
    status: 'PENDING' as Payment['status'],
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount.toString(),
        dueDate: new Date(payment.dueDate).toISOString().split('T')[0],
        status: payment.status,
      });
    } else {
      setFormData({
        amount: '',
        dueDate: '',
        status: 'PENDING',
      });
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      onClose();
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Failed to save payment. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {payment ? 'Edit Payment' : 'Create New Payment'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Payment['status'] })}
              className="w-full px-3 py-2 border rounded-md"
              required
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
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {payment ? 'Save Changes' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 