"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaEnvelope } from "react-icons/fa";
import { PDFViewer } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import VoucherPDF from "@/components/vouchers/VoucherPDF";
import Button from "@/components/ui/Button";
import Notification from "@/components/ui/Notification";
import { useTranslations } from 'next-intl';
import Input from "@/components/ui/Input";
import FormGroup from "@/components/ui/FormGroup";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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
      totalPayments: number;
    };
  };
}

const VoucherItem = () => {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('voucherPage');
  const tPDF = useTranslations('voucherPDF');
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
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [editingEmail, setEditingEmail] = useState<boolean>(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const awaitedParams = await params;
      setVoucherNumber(awaitedParams.voucherNumber as string);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    const fetchVoucher = async () => {
      if (!voucherNumber) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/vouchers/${voucherNumber}`);
        const data = await response.json();
        if (!response.ok) {
          if (data.redirect) {
            router.push(data.redirect);
            return;
          }
          throw new Error(data.error || "Failed to fetch voucher");
        }
        setVoucher(data && data.payment && data.payment.lease && typeof data.payment.lease.totalPayments === 'number'
          ? data
          : {
              ...data,
              payment: {
                ...data.payment,
                lease: {
                  ...data.payment.lease,
                  totalPayments: typeof data.payment.lease?.totalPayments === 'number' ? data.payment.lease.totalPayments : 1
                }
              }
            }
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch voucher"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [voucherNumber, router]);

  useEffect(() => {
    if (voucher && voucher.payment.lease.tenant.user.email) {
      setEmail(voucher.payment.lease.tenant.user.email);
    }
  }, [voucher]);

  const validateEmails = (value: string) => {
    if (!value) return t("emailRequired") || "At least one email is required";
    const emails = value.split(",").map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) return t("emailRequired") || "At least one email is required";
    const emailRegex = /^[^\s@]+@[^"\s]+\.[^\s@]+$/;
    for (const email of emails) {
      if (!emailRegex.test(email)) return t("invalidEmail") || `Invalid email: ${email}`;
    }
    return "";
  };

  const handlePendingEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingEmail(e.target.value);
    setEmailError(validateEmails(e.target.value));
  };

  const handleEditEmail = () => {
    setPendingEmail(email);
    setEditingEmail(true);
    setEmailError("");
  };

  const handleSaveEmail = () => {
    const validationMsg = validateEmails(pendingEmail);
    if (validationMsg) {
      setEmailError(validationMsg);
      return;
    }
    setEmail(pendingEmail);
    setEditingEmail(false);
    setEmailError("");
  };

  const handleCancelEdit = () => {
    setEditingEmail(false);
    setEmailError("");
  };

  const handleSendVoucher = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!voucher) return;
    const validationMsg = validateEmails(email);
    if (validationMsg) {
      setEmailError(validationMsg);
      return;
    }
    try {
      setSending(true);
      const blob = await pdf(<VoucherPDF voucher={voucher} t={tPDF as (key: string, params?: Record<string, string | number | Date>) => string} />).toBlob();
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onload = () => {
          const base64String = reader.result?.toString().split(',')[1];
          resolve(base64String);
        };
      });
      reader.readAsDataURL(blob);
      const base64pdf = await base64Promise;
      const emails = email.split(",").map(e => e.trim()).filter(Boolean);
      const response = await fetch("/api/vouchers/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucherId: voucher.id,
          pdfBase64: base64pdf,
          emails: emails,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send voucher");
      }
      setNotification({
        show: true,
        type: 'success',
        title: 'success',
        message: t('sendSuccess')
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    } catch (err) {
      setNotification({
        show: true,
        type: 'error',
        title: 'error',
        message: err instanceof Error ? err.message : 'sendError'
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error || t('notFound')}
      </div>
    );
  }

  return (
    <>
      {/* PDF Viewer */}
      <div className="mb-8 h-[800px]">
        <PDFViewer
          width="100%"
          height="100%"
          className="rounded-lg shadow-lg"
        >
          <VoucherPDF voucher={voucher} t={tPDF as (key: string, params?: Record<string, string | number | Date>) => string} />
        </PDFViewer>
      </div>
      <form onSubmit={handleSendVoucher} className="max-w-md mx-auto mb-6 flex flex-col gap-2 items-center">
        <FormGroup>
          {!editingEmail ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-left break-words text-gray-700 text-sm" aria-label={t('recipientEmail') || 'Recipient Email(s)'} tabIndex={0}>
                <strong>Enviar a: {email}</strong>
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditEmail}
                className="mt-1"
                aria-label={t('recipientEmail') || 'Change Email(s)'}
              >
                Actualizar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-full">
              <Input
                type="text"
                label={t('recipientEmail') || 'Recipient Email(s)'}
                placeholder={t('multipleEmailsPlaceholder') || 'Enter one or more emails, separated by commas'}
                value={pendingEmail}
                onChange={handlePendingEmailChange}
                error={emailError}
                required
                aria-label={t('recipientEmail') || 'Recipient Email(s)'}
                autoComplete="email"
                tabIndex={0}
              />
              <div className="flex gap-2 items-center justify-center">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveEmail}
                  disabled={!!emailError || !pendingEmail}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          <Button
            type="submit"
            disabled={editingEmail || sending || !!validateEmails(email) || !email}
            variant="primary"
            className="text-center"
            aria-label={t('sendVoucher')}
          >
            {t('sendVoucher')}
            <FaEnvelope className="w-5 h-5 inline-block ml-2" />
          </Button>
        </FormGroup>
      </form>
      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
};

export default VoucherItem; 