"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { FaEnvelope } from "react-icons/fa";
import { PDFViewer } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import VoucherPDF from "@/components/vouchers/VoucherPDF";
import Button from "@/components/ui/Button";
import Notification from "@/components/ui/Notification";

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
    paymentNumber: number;
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
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

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
          throw new Error(data.error || "Failed to fetch voucher");
        }

        console.log("Received voucher data:", data);
        setVoucher(data);
      } catch (err) {
        console.error("Error fetching voucher:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch voucher"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [voucherNumber]);

  const handleSendVoucher = async () => {
    if (!voucher) return;

    try {
      setSending(true);

      // Generate PDF blob
      const blob = await pdf(<VoucherPDF voucher={voucher} />).toBlob();
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => {
          const base64String = reader.result?.toString().split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(blob);
      const base64pdf = await base64Promise;

      const response = await fetch("/api/vouchers/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucherId: voucher.id,
          pdfBase64: base64pdf
        }),
      });

      const data = await response.json();
      console.log("Response data:", data);
      if (!response.ok) {
        throw new Error(data.error || "Failed to send voucher");
      }

      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        title: 'Success',
        message: 'Voucher sent successfully!'
      });

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);

    } catch (err) {
      console.error("Error sending voucher:", err);
      // Show error notification
      setNotification({
        show: true,
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to send voucher'
      });

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !voucher) {
    return (
      <Layout>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error || "Voucher not found"}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* PDF Viewer */}
          <div className="mb-8 h-[800px]">
            <PDFViewer
              width="100%"
              height="100%"
              className="rounded-lg shadow-lg"
            >
              <VoucherPDF voucher={voucher} />
            </PDFViewer>
          </div>
          <Button
            onClick={handleSendVoucher}
            disabled={sending}
            variant="primary"
            className="text-center"
          >
            Send Voucher
            <FaEnvelope className="w-5 h-5 inline-block ml-2" />
          </Button>

          {notification.show && (
            <Notification
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
