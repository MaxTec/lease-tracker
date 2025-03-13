import React, { useState } from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { FaCalendarAlt } from 'react-icons/fa';
import { differenceInDays } from 'date-fns';
import Button from '@/components/ui/Button';
import PopConfirm from '@/components/ui/PopConfirm';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import DateInput from '@/components/ui/DateInput';

interface Lease {
  id: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  paymentDay: number;
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
}

interface Payment {
  id: number;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  paymentMethod: string | null;
  transactionId: string | null;
  lease?: Lease;
}

interface PaymentScheduleProps {
  payments: Payment[];
  lease?: Lease; // Optional lease prop if provided directly
  onRecordPayment: (payment: ScheduledPayment) => void;
}

interface ScheduledPayment {
  id?: number;
  dueDate: Date;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  isExisting: boolean;
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHECK' | 'OTHER';
  transactionId?: string;
  paidDate?: Date;
}

interface PaymentFormData {
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHECK' | 'OTHER';
  transactionId?: string;
  paymentDate: string;
}

const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ payments, lease, onRecordPayment }) => {
  const [selectedPayment, setSelectedPayment] = useState<ScheduledPayment | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [paymentDateError, setPaymentDateError] = useState<string>('');

  // Get current date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the last payment date
  const lastPaymentDate = payments
    .filter(p => p.status === 'PAID')
    .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())[0]?.paidDate;

  // Get lease information from the lease prop or from the first payment
  const leaseInfo = lease || (payments.length > 0 && payments[0].lease 
    ? payments[0].lease 
    : null);
  
  if (!leaseInfo) {
    return (
      <EmptyState
        icon={<FaCalendarAlt className="w-12 h-12" />}
        title="No Lease Information"
        description="Cannot generate payment schedule without lease information."
        actionLabel="Go to Leases"
        onAction={() => {/* TODO: Add handler */}}
      />
    );
  }

  // Generate all scheduled payments based on lease dates
  const generatePaymentSchedule = (): ScheduledPayment[] => {
    const startDate = new Date(leaseInfo.startDate);
    const endDate = new Date(leaseInfo.endDate);
    const paymentDay = leaseInfo.paymentDay;
    const rentAmount = leaseInfo.rentAmount;
    
    // Map existing payments by due date for quick lookup
    const existingPaymentsByDate = new Map<string, Payment>();
    payments.forEach(payment => {
      const dueDate = new Date(payment.dueDate);
      const dateKey = `${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDate()}`;
      existingPaymentsByDate.set(dateKey, payment);
    });
    
    const scheduledPayments: ScheduledPayment[] = [];
    
    // Start from the lease start date
    const currentDate = new Date(startDate);
    
    // If payment day is specified, set the day of the first month
    if (paymentDay) {
      currentDate.setDate(paymentDay);
      
      // If the payment day is before the start date, move to the next month
      if (currentDate < startDate) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Generate payments until the end date
    while (currentDate <= endDate) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
      const existingPayment = existingPaymentsByDate.get(dateKey);
      
      if (existingPayment) {
        // Use existing payment data
        scheduledPayments.push({
          id: existingPayment.id,
          dueDate: new Date(existingPayment.dueDate),
          amount: Number(existingPayment.amount),
          status: existingPayment.status,
          isExisting: true
        });
      } else {
        // Create a new scheduled payment
        const status = currentDate < today ? 'OVERDUE' : 'PENDING';
        scheduledPayments.push({
          dueDate: new Date(currentDate),
          amount: Number(rentAmount),
          status,
          isExisting: false
        });
      }
      
      // Move to the next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return scheduledPayments;
  };
  
  const allScheduledPayments = generatePaymentSchedule();
  
  // Sort by due date
  const sortedScheduledPayments = [...allScheduledPayments].sort((a, b) => 
    a.dueDate.getTime() - b.dueDate.getTime()
  );
  
  // Past due payments
  const pastDuePayments = sortedScheduledPayments.filter(p => 
    p.dueDate < today && p.status !== 'PAID'
  );

  // Next payment (closest due date that's not past and not paid)
  const nextPayment = sortedScheduledPayments.find(p => 
    p.dueDate >= today && p.status !== 'PAID'
  );

  // Future payments (next 3 months, excluding the next payment)
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(today.getMonth() + 3);
  
  const futurePayments = sortedScheduledPayments.filter(p => {
    return p.dueDate > today && 
           p.dueDate <= threeMonthsFromNow && 
           p.status !== 'PAID' && 
           p !== nextPayment;
  }).slice(0, 3); // Limit to 3 payments

  // Identify the oldest unpaid payment across all categories
  const oldestUnpaidPayment = sortedScheduledPayments.find(p => 
    !p.isExisting && p.status !== 'PAID'
  );

  const getStatusBadge = (status: Payment['status']) => {
    const statusMap = {
      PAID: 'success',
      PENDING: 'warning',
      OVERDUE: 'error',
      CANCELLED: 'default'
    } as const;

    return (
      <Badge status={statusMap[status]}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      paymentMethod: value as PaymentFormData['paymentMethod'],
      transactionId: value !== 'BANK_TRANSFER' ? undefined : prev.transactionId
    }));
  };

  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentForm(prev => ({
      ...prev,
      transactionId: e.target.value
    }));
  };

  const handlePaymentDateChange = (value: string) => {
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    // Validate the selected date
    if (selectedDate > today) {
      setPaymentDateError('Payment date cannot be in the future');
      return;
    }

    if (lastPaymentDate && selectedDate < new Date(lastPaymentDate)) {
      setPaymentDateError('Payment date cannot be before the last payment date');
      return;
    }

    // Validate against lease start date
    const leaseStartDate = new Date(leaseInfo.startDate);
    leaseStartDate.setHours(0, 0, 0, 0);
    if (selectedDate < leaseStartDate) {
      setPaymentDateError('Payment date cannot be before the lease start date');
      return;
    }

    setPaymentDateError('');
    setPaymentForm(prev => ({
      ...prev,
      paymentDate: value
    }));
  };

  const handleConfirmPayment = () => {
    if (selectedPayment && !paymentDateError) {
      onRecordPayment({
        ...selectedPayment,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId,
        paidDate: new Date(paymentForm.paymentDate)
      });
      setSelectedPayment(null);
      setPaymentForm({ 
        paymentMethod: 'CASH',
        paymentDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  const PaymentCard = ({ payment, label }: { payment: ScheduledPayment, label?: string }) => {
    const today = new Date();
    const dueDate = new Date(payment.dueDate);
    const dayDiff = differenceInDays(today, dueDate);
    const humanReadableDate = dayDiff > 0 ? `(${dayDiff} days late)` : '';

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        {label && (
          <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>
        )}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-semibold">${payment.amount.toFixed(2)}</div>
            <div className="text-sm text-gray-500">
              Due: {payment.dueDate.toLocaleDateString()} {humanReadableDate}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(payment.status)}
            {!payment.isExisting && payment === oldestUnpaidPayment ? (
              <Button
                onClick={() => {
                  setSelectedPayment(payment);
                  setIsConfirmOpen(true);
                }}
                variant="secondary"
                size="sm"
                className="ml-2"
              >
                Track Payment
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  if (allScheduledPayments.length === 0) {
    return (
      <EmptyState
        icon={<FaCalendarAlt className="w-12 h-12" />}
        title="No Upcoming Payments"
        description="There are no upcoming payments scheduled for this lease."
        actionLabel="Create Payment Schedule"
        onAction={() => {/* TODO: Add handler */}}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Past Due Section */}
      {pastDuePayments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-red-600 mb-3">Past Due</h3>
          <div className="space-y-3">
            {pastDuePayments.map((payment, index) => (
              <PaymentCard key={payment.id || `past-due-${index}`} payment={payment} />
            ))}
          </div>
        </div>
      )}

      {/* Next Payment Section */}
      {nextPayment && (
        <div>
          <h3 className="text-lg font-medium text-indigo-600 mb-3">Next Payment</h3>
          <PaymentCard payment={nextPayment} />
        </div>
      )}

      {/* Upcoming Payments Section */}
      {futurePayments.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">Upcoming Payments</h3>
          <div className="space-y-3">
            {futurePayments.map((payment, index) => (
              <PaymentCard key={payment.id || `future-${index}`} payment={payment} />
            ))}
          </div>
        </div>
      )}

      {/* Payment Confirmation Dialog */}
      <PopConfirm
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedPayment(null);
          setPaymentForm({ 
            paymentMethod: 'CASH',
            paymentDate: new Date().toISOString().split('T')[0]
          });
          setPaymentDateError('');
        }}
        onConfirm={handleConfirmPayment}
        title="Record Payment"
        confirmText="Record Payment"
      >
        <div className="space-y-4">
          <div>
            <DateInput
              label="Payment Date"
              value={paymentForm.paymentDate}
              onChange={handlePaymentDateChange}
              error={paymentDateError}
            />
          </div>

          <div>
            <Select
              value={paymentForm.paymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              options={[
                { value: 'CASH', label: 'Cash' },
                { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                { value: 'CREDIT_CARD', label: 'Credit Card' },
                { value: 'CHECK', label: 'Check' },
                { value: 'OTHER', label: 'Other' }
              ]}
              label="Payment Method"
            />
          </div>

          {paymentForm.paymentMethod === 'BANK_TRANSFER' && (
            <div>
              <Input
                type="text"
                value={paymentForm.transactionId || ''}
                onChange={handleTransactionIdChange}
                placeholder="Enter transaction ID"
                label="Transaction ID"
              />
            </div>
          )}
        </div>
      </PopConfirm>
    </div>
  );
};

export default PaymentSchedule; 