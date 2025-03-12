'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { format } from 'date-fns';
import { FaFileInvoiceDollar, FaPrint, FaEnvelope } from 'react-icons/fa';
import { PDFDownloadLink } from '@react-pdf/renderer';
import VoucherPDF from '@/components/vouchers/VoucherPDF';

interface Voucher {
  id: string;
  voucherNumber: string;
  status: string;
  payment: {
    amount: number;
    dueDate: string;
    paidDate: string;
    paymentMethod: string;
    transactionId: string | null;
    lease: {
      tenant: {
        user: {
          name: string;
          email: string;
        };
      };
      unit: {
        unitNumber: string;
        property: {
          name: string;
          address: string;
        };
      };
    };
  };
}

export default function VoucherPage() {
  const params = useParams();
  const router = useRouter();
  const [voucherNumber, setVoucherNumber] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const awaitedParams = await params;
      console.log("Awaited params:", awaitedParams);
      setVoucherNumber(awaitedParams.voucherNumber as string);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    const fetchVoucher = async () => {
      if (!voucherNumber) return;
      
      console.log("Fetching voucher with number:", voucherNumber);
      try {
        setLoading(true);
        const response = await fetch(`/api/vouchers/${voucherNumber}`);
        console.log("Response status:", response.status);
        const data = await response.json();
        
        if (!response.ok) {
          if (data.redirect) {
            router.push(data.redirect);
            return;
          }
          throw new Error(data.error || 'Failed to fetch voucher');
        }
        
        console.log("Received voucher data:", data);
        setVoucher(data);
      } catch (err) {
        console.error('Error fetching voucher:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch voucher');
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [voucherNumber, router]);

  const handleSendVoucher = async () => {
    if (!voucher) return;
    
    try {
      setSending(true);
      setSendError(null);
      
      const response = await fetch('/api/vouchers/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucherId: voucher.id,
        }),
      });
      
      const data = await response.json();
      console.log("Response data:", data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send voucher');
      }
      
      // Show success message or update UI as needed
      alert('Voucher sent successfully!');
    } catch (err) {
      console.error('Error sending voucher:', err);
      setSendError(err instanceof Error ? err.message : 'Failed to send voucher');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className='flex items-center justify-center min-h-[200px]'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
        </div>
      </Layout>
    );
  }

  if (error || !voucher) {
    return (
      <Layout>
        <div className='bg-red-50 text-red-600 p-4 rounded-md'>
          {error || 'Voucher not found'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-3xl mx-auto'>
          <div className='bg-white rounded-lg shadow-lg p-8'>
            {/* Header */}
            <div className='flex justify-between items-start mb-8'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 flex items-center'>
                  <FaFileInvoiceDollar className='mr-2 text-indigo-600' />
                  Payment Voucher
                </h1>
                <p className='text-gray-600 mt-1'>Voucher #{voucher.voucherNumber}</p>
              </div>
              <div className='print:hidden flex space-x-4'>
                <button
                  onClick={handleSendVoucher}
                  disabled={sending}
                  className='text-gray-600 hover:text-gray-900 disabled:opacity-50'
                  title='Send voucher to tenant'
                >
                  <FaEnvelope className='w-6 h-6' />
                </button>
                <PDFDownloadLink
                  document={<VoucherPDF voucher={voucher} />}
                  fileName={`voucher-${voucher.voucherNumber}.pdf`}
                  className='text-gray-600 hover:text-gray-900'
                >
                  {({ loading }) => (
                    <button
                      disabled={loading}
                      title='Download PDF'
                      className='text-gray-600 hover:text-gray-900 disabled:opacity-50'
                    >
                      <FaPrint className='w-6 h-6' />
                    </button>
                  )}
                </PDFDownloadLink>
              </div>
            </div>

            {sendError && (
              <div className='bg-red-50 text-red-600 p-4 rounded-md mb-8'>
                {sendError}
              </div>
            )}

            {/* Property & Tenant Information */}
            <div className='grid grid-cols-2 gap-8 mb-8'>
              <div>
                <h2 className='text-sm font-medium text-gray-500 mb-2'>Property</h2>
                <p className='font-medium text-gray-900'>{voucher.payment.lease.unit.property.name}</p>
                <p className='text-gray-600'>Unit {voucher.payment.lease.unit.unitNumber}</p>
                <p className='text-gray-600'>{voucher.payment.lease.unit.property.address}</p>
              </div>
              <div>
                <h2 className='text-sm font-medium text-gray-500 mb-2'>Tenant</h2>
                <p className='font-medium text-gray-900'>{voucher.payment.lease.tenant.user.name}</p>
                <p className='text-gray-600'>{voucher.payment.lease.tenant.user.email}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className='bg-gray-50 rounded-lg p-6 mb-8'>
              <h2 className='text-lg font-medium text-gray-900 mb-4'>Payment Details</h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-500'>Amount</p>
                  <p className='text-lg font-medium text-gray-900'>
                    ${voucher.payment.amount}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Payment Method</p>
                  <p className='font-medium text-gray-900'>
                    {voucher.payment.paymentMethod?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Due Date</p>
                  <p className='font-medium text-gray-900'>
                    {format(new Date(voucher.payment.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Paid Date</p>
                  <p className='font-medium text-gray-900'>
                    {format(new Date(voucher.payment.paidDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                {voucher.payment.transactionId && (
                  <div className='col-span-2'>
                    <p className='text-sm text-gray-500'>Transaction ID</p>
                    <p className='font-medium text-gray-900'>{voucher.payment.transactionId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className='text-center text-gray-500 text-sm'>
              <p>This is an automatically generated payment voucher.</p>
              <p>Please keep this for your records.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
