import React, { memo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatDate } from "@/utils/dateUtils";
import { LOGO_BASE64 } from "@/constants";
import { formatCurrencyMXN } from "@/utils/numberUtils";

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

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: "10mm",
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: "8mm",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconPlaceholder: {
    width: 120,
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  voucherInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
  },
  voucherNumber: {
    fontSize: 12,
    color: "#656565",
  },
  voucherDate: {
    fontSize: 12,
    color: "#656565",
    fontWeight: "bold",
  },
  mainContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "5mm",
  },
  column: {
    flex: 1,
    marginRight: "5mm",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#656565",
    marginBottom: "2.5mm",
  },
  textBase: {
    fontSize: 12,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#1a1a1a",
    marginBottom: 8,
  },
  inlineLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#1a1a1a",
  },
  inlineText: {
    fontSize: 12,
    color: "#1a1a1a",
  },
  inlineContainer: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 4,
  },
  paymentDetailsContainer: {
    backgroundColor: "#f8f9fa",
    padding: "5mm",
    borderRadius: 4,
  },
  paymentDetailsTitle: {
    fontSize: 14,
    color: "#656565",
    marginBottom: "5mm",
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paymentGridItem: {
    width: "25%",
  },
  label: {
    fontSize: 12,
    color: "#656565",
    marginBottom: 6,
  },
  footer: {
    marginTop: "5mm",
    textAlign: "center",
    color: "#656565",
  },
  footerText: {
    fontSize: 10,
    marginBottom: 4,
  },
  signatureSection: {
    marginTop: "20mm",
    paddingTop: "10mm",
    // borderTop: "1pt solid #e5e7eb",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "15mm",
  },
  signatureBox: {
    width: "45%",
  },
  signatureLine: {
    borderBottom: "1pt solid #000000",
    marginBottom: "4mm",
  },
  signatureLabel: {
    fontSize: 10,
    color: "#656565",
    textAlign: "center",
  },
  signatureDate: {
    fontSize: 10,
    color: "#656565",
    textAlign: "center",
    marginTop: "5mm",
  },
});

interface VoucherPDFProps {
  voucher: Voucher;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
}

const VoucherPDF: React.FC<VoucherPDFProps> = memo(({ voucher, t }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <View style={styles.header}>
        <Image src={LOGO_BASE64} style={styles.iconPlaceholder} />
        <View style={styles.titleContainer}>
          <View>
            <Text style={styles.title}>{t("title")}</Text>
            <Text style={styles.voucherNumber}>
              {t("voucherNumber", { number: voucher.voucherNumber })}
            </Text>
          </View>
          <View style={styles.voucherInfo}>
            <Text style={styles.voucherDate}>
              {formatDate(new Date(), "MMM dd, yyyy")}
            </Text>
            <Text style={styles.voucherNumber}>
              {t("paymentOf", {
                current: voucher.payment.paymentNumber,
                total: voucher.payment.lease.totalPayments,
              })}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>{t("property")}</Text>
          <Text style={styles.subtitle}>
            {voucher.payment.lease.unit.property.name}
          </Text>
          <Text style={styles.textBase}>
            {t("unit", { number: voucher.payment.lease.unit.unitNumber })}
          </Text>
          <View style={styles.inlineContainer}>
            <Text style={styles.inlineLabel}>{t("address")}:</Text>
            <Text style={styles.inlineText}>
              {voucher.payment.lease.unit.property.address}
            </Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.sectionTitle}>{t("tenant")}</Text>
          <View style={styles.inlineContainer}>
            <Text style={styles.inlineLabel}>{t("name")}:</Text>
            <Text style={styles.inlineText}>
              {voucher.payment.lease.tenant.user.name}
            </Text>
          </View>
          <View style={styles.inlineContainer}>
            <Text style={styles.inlineLabel}>{t("email")}:</Text>
            <Text style={styles.inlineText}>
              {voucher.payment.lease.tenant.user.email}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.paymentDetailsTitle}>{t("paymentDetails")}</Text>
      <View style={styles.paymentDetailsContainer}>
        <View style={styles.paymentGrid}>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>{t("amount")}</Text>
            <Text style={styles.textBase}>{formatCurrencyMXN(voucher.payment.amount)}</Text>
          </View>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>{t("paymentMethod")}</Text>
            <Text style={styles.textBase}>
              {voucher.payment.paymentMethod?.replace("_", " ")}
            </Text>
          </View>
          <View style={styles.paymentGridItem}>
            <Text style={styles.label}>{t("paidDate")}</Text>
            <Text style={styles.textBase}>
              {formatDate(voucher.payment.paidDate, "MMM dd, yyyy")}
            </Text>
          </View>
          {voucher.payment.transactionId && (
            <View style={styles.paymentGridItem}>
              <Text style={styles.label}>{t("transactionId")}</Text>
              <Text style={styles.textBase}>
                {voucher.payment.transactionId}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{t("footer1")}</Text>
        <Text style={styles.footerText}>{t("footer2")}</Text>
      </View>
    </Page>
  </Document>
));

VoucherPDF.displayName = "VoucherPDF";

export default VoucherPDF;